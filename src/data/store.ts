import { create } from 'zustand'
import type { Observation, Need } from './types'

interface DataState {
  observations: Observation[]
  needs: Need[]
  isLoading: boolean
  lastUpdate: Date | null
  sheetsConfig: {
    spreadsheetUrl: string
  }

  setObservations: (obs: Observation[]) => void
  setNeeds: (needs: Need[]) => void
  mergeObservations: (obs: Observation[]) => void
  mergeNeeds: (needs: Need[]) => void
  setLoading: (loading: boolean) => void
  setLastUpdate: (date: Date) => void
  setSheetsConfig: (config: { spreadsheetUrl: string }) => void
  updateObservationPotential: (id: string, potential: number) => void
  updateObservationField: (id: string, field: keyof Observation, value: string | number) => void
  addObservation: (obs: Observation) => void
  clearData: () => void
}

const STORAGE_KEY = 'biodesign_sheets_config'

function loadSheetsConfig(): { spreadsheetUrl: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return { spreadsheetUrl: '' }
}

export const useDataStore = create<DataState>((set) => ({
  observations: [],
  needs: [],
  isLoading: false,
  lastUpdate: null,
  sheetsConfig: loadSheetsConfig(),

  setObservations: (observations) => set({ observations, lastUpdate: new Date() }),
  setNeeds: (needs) => set({ needs, lastUpdate: new Date() }),

  mergeObservations: (newObs) =>
    set((state) => {
      const existingIds = new Set(state.observations.map((o) => o.idMae))
      const unique = newObs.filter((o) => !existingIds.has(o.idMae))
      return {
        observations: [...state.observations, ...unique],
        lastUpdate: new Date(),
      }
    }),

  mergeNeeds: (newNeeds) =>
    set((state) => {
      const existingIds = new Set(state.needs.map((n) => n.idFilha))
      const unique = newNeeds.filter((n) => !existingIds.has(n.idFilha))
      return {
        needs: [...state.needs, ...unique],
        lastUpdate: new Date(),
      }
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setLastUpdate: (lastUpdate) => set({ lastUpdate }),

  setSheetsConfig: (config) =>
    set(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      return { sheetsConfig: config }
    }),

  updateObservationPotential: (id, potential) =>
    set((state) => ({
      observations: state.observations.map((o) =>
        o.id === id ? { ...o, potential } : o
      ),
    })),

  updateObservationField: (id, field, value) =>
    set((state) => ({
      observations: state.observations.map((o) =>
        o.id === id ? { ...o, [field]: value } : o
      ),
    })),

  addObservation: (obs) =>
    set((state) => ({
      observations: [obs, ...state.observations],
      lastUpdate: new Date(),
    })),

  clearData: () => set({ observations: [], needs: [], lastUpdate: null }),
}))
