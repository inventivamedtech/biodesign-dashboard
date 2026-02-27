import Papa from 'papaparse'
import { normalizeObservations, normalizeNeeds } from './normalizer'
import type { Observation, Need } from './types'

interface SheetsResult {
  observations: Observation[]
  needs: Need[]
}

const PROXIES = [
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => url,
]

async function fetchCSV(url: string): Promise<string> {
  for (const proxyFn of PROXIES) {
    try {
      const proxyUrl = proxyFn(url)
      const response = await fetch(proxyUrl, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      if (!response.ok) continue
      const text = await response.text()
      if (text && text.length > 50) return text
    } catch {
      continue
    }
  }
  throw new Error('All proxies failed')
}

/**
 * Extracts spreadsheet ID from any Google Sheets URL format:
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
 * - https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
 * - https://docs.google.com/spreadsheets/d/e/PUBLISHED_ID/pubhtml
 */
function extractSpreadsheetId(url: string): string | null {
  // Match /d/{ID}/ or /d/e/{ID}/
  const match = url.match(/\/spreadsheets\/d\/(?:e\/)?([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

/**
 * Builds CSV export URL for a specific sheet by name.
 * Uses the gviz endpoint which works for publicly shared spreadsheets.
 */
function sheetCsvUrl(spreadsheetId: string, sheetName: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&_t=${Date.now()}`
}

const OBS_SHEET_NAMES = ['Observacoes', 'Firts needs', 'First needs', 'Observations', 'Observações']
const NEEDS_SHEET_NAMES = ['Needs Stage 0', 'Stage 0_Need Scope', 'Stage 0_83 needs', 'First Needs - categorizado', 'Stage 0']

async function tryFetchSheet(spreadsheetId: string, candidates: string[]): Promise<{ csv: string; sheetName: string } | null> {
  for (const name of candidates) {
    try {
      const url = sheetCsvUrl(spreadsheetId, name)
      const csv = await fetchCSV(url)
      // Verify it's actual CSV data (not an error page)
      if (csv.includes(',') && !csv.includes('<!DOCTYPE')) {
        return { csv, sheetName: name }
      }
    } catch {
      continue
    }
  }
  return null
}

/**
 * Load both sheets from a single Google Sheets URL.
 * The spreadsheet must be shared as "Anyone with the link can view".
 */
export async function loadFromSheets(spreadsheetUrl: string): Promise<SheetsResult> {
  const result: SheetsResult = { observations: [], needs: [] }

  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)
  if (!spreadsheetId) {
    throw new Error('URL inválida. Cole a URL da sua planilha Google Sheets.')
  }

  // Fetch both sheets in parallel
  const [obsResult, needsResult] = await Promise.allSettled([
    tryFetchSheet(spreadsheetId, OBS_SHEET_NAMES),
    tryFetchSheet(spreadsheetId, NEEDS_SHEET_NAMES),
  ])

  if (obsResult.status === 'fulfilled' && obsResult.value) {
    const parsed = Papa.parse<Record<string, unknown>>(obsResult.value.csv, {
      header: true,
      skipEmptyLines: true,
    })
    if (parsed.data.length > 0) {
      result.observations = normalizeObservations(parsed.data, 'sheets')
    }
  }

  if (needsResult.status === 'fulfilled' && needsResult.value) {
    const parsed = Papa.parse<Record<string, unknown>>(needsResult.value.csv, {
      header: true,
      skipEmptyLines: true,
    })
    if (parsed.data.length > 0) {
      result.needs = normalizeNeeds(parsed.data, 'sheets')
    }
  }

  if (result.observations.length === 0 && result.needs.length === 0) {
    throw new Error('Nenhuma aba encontrada. Verifique se as abas se chamam "Observacoes" e "Needs Stage 0".')
  }

  return result
}
