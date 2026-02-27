import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataStore } from '../data/store'
import { FilterBar } from '../components/FilterBar'
import { PotentialDots } from '../components/PotentialDots'
import { ClusterBadge } from '../components/ClusterBadge'
import { ArrowUpDown } from 'lucide-react'

export function NeedsStage0() {
  const { needs } = useDataStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState<'potential' | 'alphabetical' | 'cluster'>('potential')

  const filterDefs = useMemo(() => {
    const clusters = [...new Set(needs.map((n) => n.cluster).filter(Boolean))].sort()
    const members = [...new Set(needs.map((n) => n.name).filter(Boolean))].sort()
    const types = [...new Set(needs.map((n) => n.type).filter(Boolean))].sort()

    return [
      {
        key: 'cluster',
        label: 'Cluster',
        options: clusters.map((c) => ({
          value: c,
          label: c,
          count: needs.filter((n) => n.cluster === c).length,
        })),
      },
      {
        key: 'name',
        label: 'Membro',
        options: members.map((m) => ({
          value: m,
          label: m,
          count: needs.filter((n) => n.name === m).length,
        })),
      },
      {
        key: 'type',
        label: 'Tipo',
        options: types.map((t) => ({
          value: t,
          label: t,
          count: needs.filter((n) => n.type === t).length,
        })),
      },
      {
        key: 'potential',
        label: 'Potencial',
        options: [0, 1, 2, 3].map((p) => ({
          value: String(p),
          label: `Potencial ${p}`,
          count: needs.filter((n) => n.potential === p).length,
        })),
      },
    ]
  }, [needs])

  const filtered = useMemo(() => {
    const result = needs.filter((n) => {
      if (search) {
        const term = search.toLowerCase()
        const match =
          n.observation.toLowerCase().includes(term) ||
          n.problem.toLowerCase().includes(term) ||
          n.needStatement.toLowerCase().includes(term) ||
          n.population.toLowerCase().includes(term)
        if (!match) return false
      }
      if (filters.cluster && n.cluster !== filters.cluster) return false
      if (filters.name && n.name !== filters.name) return false
      if (filters.type && n.type !== filters.type) return false
      if (filters.potential && n.potential !== Number(filters.potential)) return false
      return true
    })

    result.sort((a, b) => {
      if (sortBy === 'potential') return b.potential - a.potential
      if (sortBy === 'cluster') return (a.cluster || '').localeCompare(b.cluster || '')
      return a.observation.localeCompare(b.observation)
    })

    return result
  }, [needs, search, filters, sortBy])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Needs Stage 0</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} de {needs.length} needs
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <ArrowUpDown size={14} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white cursor-pointer"
          >
            <option value="potential">Potencial</option>
            <option value="cluster">Cluster</option>
            <option value="alphabetical">Alfabético</option>
          </select>
        </div>
      </div>

      <FilterBar
        filters={filterDefs}
        activeFilters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar need, problema, população..."
      />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID Filha</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID Mãe</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Pot.</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Observação</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Problema</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Need Statement</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-28">Cluster</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">Membro</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => navigate(`/need/${n.id}`)}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-semibold">
                      {n.idFilha}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {n.idMae && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                        {n.idMae}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <PotentialDots potential={n.potential} />
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 max-w-[200px]">
                    <span className="line-clamp-2 text-xs">{n.observation}</span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-800 max-w-[200px]">
                    <span className="line-clamp-2 text-xs font-medium">{n.problem || '—'}</span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500 max-w-[250px]">
                    <span className="line-clamp-2 text-xs italic">
                      {n.needStatement ? `"${n.needStatement}"` : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {n.cluster && <ClusterBadge cluster={n.cluster} />}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">
                    {n.name || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg mb-1">Nenhuma need encontrada</p>
            <p className="text-sm">Tente ajustar os filtros ou termos de busca</p>
          </div>
        )}
      </div>
    </div>
  )
}
