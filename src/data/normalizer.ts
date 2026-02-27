import type { Observation, Need } from './types'

let obsCounter = 0
let needCounter = 0

function padId(n: number): string {
  return String(n).padStart(3, '0')
}

export function resetCounters() {
  obsCounter = 0
  needCounter = 0
}

function clean(val: unknown): string {
  if (val === null || val === undefined) return ''
  return String(val).trim()
}

function cleanNumber(val: unknown): number {
  if (val === null || val === undefined) return 0
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

export function normalizeObservations(
  rows: Record<string, unknown>[],
  source: 'sheets' | 'upload' = 'upload'
): Observation[] {
  return rows
    .filter(row => {
      const obs = clean(row['Observations'] || row['observations'])
      return obs.length > 0
    })
    .map(row => {
      const fromSheet = clean(row['id_mae'])
      const idMae = fromSheet || `OBS-${padId(++obsCounter)}`
      return {
        id: idMae,
        idMae,
        potential: cleanNumber(row['Potencial (0-3)'] || row['potential'] || row['Potencial']),
        type: clean(row['Tipo'] || row['Type'] || row['type']),
        observation: clean(row['Observations'] || row['observations'] || row['Observation']),
        source,
      }
    })
}

export function normalizeNeeds(
  rows: Record<string, unknown>[],
  source: 'sheets' | 'upload' = 'upload'
): Need[] {
  return rows
    .filter(row => {
      const obs = clean(row['Observations'] || row['observations'] || row['Observation'])
      return obs.length > 0
    })
    .map(row => {
      const fromSheetFilha = clean(row['id_filha'])
      const fromSheetMae = clean(row['id_mae'])
      const idFilha = fromSheetFilha || `NEED-${padId(++needCounter)}`
      return {
        id: idFilha,
        idFilha,
        idMae: fromSheetMae,
        name: clean(row['Nome'] || row['Membro responsável'] || row['name']),
        potential: cleanNumber(row['Potencial (0-3)'] || row['potential'] || row['Potencial']),
        type: clean(row['Type'] || row['Tipo'] || row['type']),
        observation: clean(row['Observations'] || row['observations'] || row['Observation']),
        problem: clean(row['Problem'] || row['problem']),
        population: clean(row['Population'] || row['population']),
        intendedOutcome: clean(row['Intend outcome'] || row['intendedOutcome'] || row['Intended outcome']),
        needStatement: clean(
          row['Previous Need Statements'] ||
          row['Need Statements'] ||
          row['needStatement'] ||
          row['Need Statement']
        ),
        cluster: clean(row['Cluster'] || row['cluster']),
        source,
      }
    })
}
