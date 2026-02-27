import { useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Observations } from './pages/Observations'
import { NeedsStage0 } from './pages/NeedsStage0'
import { CategoryView } from './pages/CategoryView'
import { CompareTool } from './pages/CompareTool'
import { NeedDetail } from './pages/NeedDetail'
import { DataSourcePanel } from './components/DataSourcePanel'
import { useDataStore } from './data/store'
import { loadFromSheets } from './data/sheetsLoader'

const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1UMPPpHTUgQKfsQu_nRrfHYJjnt70oqv3b4C8MeZrHtw/edit'
const SYNC_INTERVAL = 60_000 // 60 seconds

function useAutoLoadSheets() {
  const { observations, needs, setObservations, setNeeds, setLoading } = useDataStore()

  const refresh = useCallback(() => {
    setLoading(true)
    return loadFromSheets(SHEETS_URL)
      .then((result) => {
        if (result.observations.length > 0) setObservations(result.observations)
        if (result.needs.length > 0) setNeeds(result.needs)
      })
      .catch((err) => console.warn('Load from Sheets failed:', err))
      .finally(() => setLoading(false))
  }, [setObservations, setNeeds, setLoading])

  // Initial load
  useEffect(() => {
    if (observations.length > 0 || needs.length > 0) return
    refresh()
  }, [])

  // Auto-sync every 60s
  useEffect(() => {
    const id = setInterval(refresh, SYNC_INTERVAL)
    return () => clearInterval(id)
  }, [refresh])

  return refresh
}

export default function App() {
  const refresh = useAutoLoadSheets()

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onRefresh={refresh} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/observations" element={<Observations />} />
          <Route path="/needs" element={<NeedsStage0 />} />
          <Route path="/categories" element={<CategoryView />} />
          <Route path="/compare" element={<CompareTool />} />
          <Route path="/need/:id" element={<NeedDetail />} />
          <Route path="/data" element={<DataSourcePanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
