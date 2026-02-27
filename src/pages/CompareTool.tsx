import { useState, useMemo } from 'react'
import { useDataStore } from '../data/store'
import { ClusterBadge } from '../components/ClusterBadge'
import { PotentialDots } from '../components/PotentialDots'
import { Search, X, GitCompare } from 'lucide-react'
import type { Need } from '../data/types'

export function CompareTool() {
  const { needs } = useDataStore()
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')

  const searchResults = useMemo(() => {
    if (!search) return []
    const term = search.toLowerCase()
    return needs
      .filter(
        (n) =>
          !selected.includes(n.id) &&
          (n.observation.toLowerCase().includes(term) ||
            n.problem.toLowerCase().includes(term) ||
            n.needStatement.toLowerCase().includes(term) ||
            n.cluster.toLowerCase().includes(term))
      )
      .slice(0, 8)
  }, [needs, search, selected])

  const selectedNeeds = useMemo(
    () => selected.map((id) => needs.find((n) => n.id === id)).filter(Boolean) as Need[],
    [selected, needs]
  )

  const addNeed = (id: string) => {
    if (selected.length < 4 && !selected.includes(id)) {
      setSelected([...selected, id])
      setSearch('')
    }
  }

  const removeNeed = (id: string) => {
    setSelected(selected.filter((s) => s !== id))
  }

  const fields: { key: keyof Need; label: string }[] = [
    { key: 'observation', label: 'Observação' },
    { key: 'problem', label: 'Problema' },
    { key: 'population', label: 'População' },
    { key: 'intendedOutcome', label: 'Resultado esperado' },
    { key: 'needStatement', label: 'Need Statement' },
    { key: 'cluster', label: 'Cluster' },
    { key: 'type', label: 'Tipo' },
    { key: 'name', label: 'Membro' },
  ]

  const COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706']

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Comparar Needs</h1>
        <p className="text-sm text-slate-500 mt-1">
          Selecione 2 a 4 needs para comparar lado a lado
        </p>
      </div>

      {/* Search & Add */}
      <div className="relative mb-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar need para adicionar..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={selected.length >= 4}
            />
          </div>
          <span className="text-xs text-slate-400">{selected.length}/4 selecionadas</span>
        </div>

        {searchResults.length > 0 && (
          <div className="absolute z-10 top-full mt-1 w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {searchResults.map((need) => (
              <button
                key={need.id}
                onClick={() => addNeed(need.id)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
              >
                <p className="text-xs font-mono text-slate-400">{need.idFilha}</p>
                <p className="text-sm text-slate-700 line-clamp-1">
                  {need.needStatement || need.problem || need.observation}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <PotentialDots potential={need.potential} />
                  <ClusterBadge cluster={need.cluster} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedNeeds.map((need, i) => (
            <span
              key={need.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: COLORS[i] }}
            >
              {need.idFilha} — {(need.needStatement || need.problem || need.observation).substring(0, 30)}...
              <button onClick={() => removeNeed(need.id)} className="hover:opacity-70">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      {selectedNeeds.length >= 2 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 w-36">
                    Campo
                  </th>
                  {selectedNeeds.map((need, i) => (
                    <th
                      key={need.id}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: COLORS[i], borderBottom: `3px solid ${COLORS[i]}` }}
                    >
                      {need.idFilha || `Need ${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Potential row */}
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-3 text-xs font-semibold text-slate-500 bg-slate-50">
                    Potencial
                  </td>
                  {selectedNeeds.map((need) => (
                    <td key={need.id} className="px-4 py-3">
                      <PotentialDots potential={need.potential} showLabel />
                    </td>
                  ))}
                </tr>

                {/* Other fields */}
                {fields.map((field) => (
                  <tr key={field.key} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500 bg-slate-50 align-top">
                      {field.label}
                    </td>
                    {selectedNeeds.map((need) => {
                      const value = need[field.key]
                      return (
                        <td key={need.id} className="px-4 py-3 text-sm text-slate-700 align-top">
                          {field.key === 'cluster' ? (
                            <ClusterBadge cluster={String(value || '')} />
                          ) : (
                            String(value || '—')
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <GitCompare size={48} className="mb-4" />
          <p className="text-lg font-medium mb-1">Selecione ao menos 2 needs</p>
          <p className="text-sm">Use a busca acima para adicionar needs à comparação</p>
        </div>
      )}
    </div>
  )
}
