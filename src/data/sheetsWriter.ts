// URL do deploy do Google Apps Script
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyOQXLEeJsH_jwqdpIzg9NPqxb5RzU0XGlVtfVxQfK5mAO8BOvoMvz2dNUDTnutKvfq/exec'

interface UpdateCellParams {
  sheet: string
  idColumn: string
  idValue: string
  column: string
  value: string | number
}

export async function updateSheetCell(params: UpdateCellParams): Promise<{ success: boolean; error?: string }> {
  try {
    const query = new URLSearchParams({
      action: 'update',
      sheet: params.sheet,
      idColumn: params.idColumn,
      idValue: params.idValue,
      column: params.column,
      value: String(params.value),
    })

    const url = `${APPS_SCRIPT_URL}?${query.toString()}`
    const response = await fetch(url)
    const text = await response.text()

    try {
      return JSON.parse(text)
    } catch {
      return { success: response.ok }
    }
  } catch (err) {
    console.warn('Erro ao salvar no Sheets:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export function updateObservationPotentialInSheets(idMae: string, potential: number) {
  return updateSheetCell({
    sheet: 'Observacoes',
    idColumn: 'id_mae',
    idValue: idMae,
    column: 'Potencial (0-3)',
    value: potential,
  })
}

export function updateObservationTypeInSheets(idMae: string, type: string) {
  return updateSheetCell({
    sheet: 'Observacoes',
    idColumn: 'id_mae',
    idValue: idMae,
    column: 'Type',
    value: type,
  })
}

export function updateObservationTextInSheets(idMae: string, text: string) {
  return updateSheetCell({
    sheet: 'Observacoes',
    idColumn: 'id_mae',
    idValue: idMae,
    column: 'Observations',
    value: text,
  })
}

interface AppendRowParams {
  sheet: string
  data: Record<string, string | number>
}

export async function appendSheetRow(params: AppendRowParams): Promise<{ success: boolean; error?: string }> {
  try {
    const query = new URLSearchParams({ action: 'append', sheet: params.sheet })
    for (const [key, value] of Object.entries(params.data)) {
      query.set(`col_${key}`, String(value))
    }

    const url = `${APPS_SCRIPT_URL}?${query.toString()}`
    const response = await fetch(url)
    const text = await response.text()

    try {
      return JSON.parse(text)
    } catch {
      return { success: response.ok }
    }
  } catch (err) {
    console.warn('Erro ao adicionar linha no Sheets:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export function addObservationToSheets(obs: { idMae: string; potential: number; type: string; observation: string }) {
  return appendSheetRow({
    sheet: 'Observacoes',
    data: {
      'id_mae': obs.idMae,
      'Potencial (0-3)': obs.potential,
      'Type': obs.type,
      'Observations': obs.observation,
    },
  })
}
