import { normalizeObservations, normalizeNeeds } from './normalizer'
import type { Observation, Need } from './types'

const API_KEY = 'AIzaSyAjbDBoekw0s4DDpMe83TkIB5VG-8NxIXc'

interface SheetsResult {
  observations: Observation[]
  needs: Need[]
}

/**
 * Extracts spreadsheet ID from any Google Sheets URL format.
 */
function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/(?:e\/)?([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

/**
 * Fetch a single sheet as rows using the Google Sheets API v4.
 * Returns an array of objects keyed by the header row.
 */
async function fetchSheet(
  spreadsheetId: string,
  sheetName: string
): Promise<Record<string, unknown>[] | null> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) return null

  const json = await res.json()
  const values: string[][] = json.values
  if (!values || values.length < 2) return null

  const headers = values[0]
  return values.slice(1).map((row) => {
    const obj: Record<string, unknown> = {}
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? ''
    })
    return obj
  })
}

const OBS_SHEET_NAMES = ['Observacoes', 'Firts needs', 'First needs', 'Observations', 'Observações']
const NEEDS_SHEET_NAMES = ['Needs Stage 0', 'Stage 0_Need Scope', 'Stage 0_83 needs', 'First Needs - categorizado', 'Stage 0']

async function tryFetchSheet(
  spreadsheetId: string,
  candidates: string[]
): Promise<Record<string, unknown>[] | null> {
  for (const name of candidates) {
    try {
      const rows = await fetchSheet(spreadsheetId, name)
      if (rows && rows.length > 0) return rows
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

  const [obsRows, needsRows] = await Promise.allSettled([
    tryFetchSheet(spreadsheetId, OBS_SHEET_NAMES),
    tryFetchSheet(spreadsheetId, NEEDS_SHEET_NAMES),
  ])

  if (obsRows.status === 'fulfilled' && obsRows.value) {
    result.observations = normalizeObservations(obsRows.value, 'sheets')
  }

  if (needsRows.status === 'fulfilled' && needsRows.value) {
    result.needs = normalizeNeeds(needsRows.value, 'sheets')
  }

  if (result.observations.length === 0 && result.needs.length === 0) {
    throw new Error('Nenhuma aba encontrada. Verifique se as abas se chamam "Observacoes" e "Needs Stage 0".')
  }

  return result
}
