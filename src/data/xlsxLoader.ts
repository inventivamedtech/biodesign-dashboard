import * as XLSX from 'xlsx'
import { normalizeObservations, normalizeNeeds } from './normalizer'
import type { Observation, Need } from './types'

interface XlsxResult {
  observations: Observation[]
  needs: Need[]
}

const OBSERVATIONS_SHEETS = ['Observacoes', 'Firts needs', 'First needs', 'Observations', 'Observações']
const NEEDS_SHEETS = [
  'Stage 0_Need Scope',
  'Stage 0_83 needs',
  'First Needs - categorizado',
  'Stage 0',
  'Needs Stage 0',
]

function findSheet(workbook: XLSX.WorkBook, candidates: string[]): string | null {
  for (const name of candidates) {
    if (workbook.SheetNames.includes(name)) return name
  }
  return null
}

export async function parseXlsxFile(file: File): Promise<XlsxResult> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })

  const obsSheetName = findSheet(workbook, OBSERVATIONS_SHEETS)
  const needsSheetName = findSheet(workbook, NEEDS_SHEETS)

  let observations: Observation[] = []
  let needs: Need[] = []

  if (obsSheetName) {
    const sheet = workbook.Sheets[obsSheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
    observations = normalizeObservations(rows, 'upload')
  }

  if (needsSheetName) {
    const sheet = workbook.Sheets[needsSheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
    needs = normalizeNeeds(rows, 'upload')
  }

  return { observations, needs }
}
