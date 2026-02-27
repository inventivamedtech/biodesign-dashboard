import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataStore } from '../data/store'
import { ClusterBadge } from '../components/ClusterBadge'
import { PotentialDots } from '../components/PotentialDots'
import { getClusterColor } from '../lib/colors'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { GroupByKey } from '../data/types'

export function CategoryView() {
  const { needs } = useDataStore()
  const navigate = useNavigate()
  const [groupBy, setGroupBy] = useState<GroupByKey>('cluster')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const groups = useMemo(() => {
    const map = new Map<string, typeof needs>()
    needs.forEach((n) => {
      const key =
        groupBy === 'cluster'
          ? n.cluster || 'Sem cluster'
          : groupBy === 'type'
          ? n.type || 'Sem tipo'
          : n.name || 'Sem membro'
      const arr = map.get(key) || []
      arr.push(n)
      map.set(key, arr)
    })

    return [...map.entries()]
      .map(([name, items]) => ({
        name,
        items,
        count: items.length,
        avgPotential: items.reduce((s, n) => s + n.potential, 0) / items.length,
      }))
      .sort((a, b) => b.count - a.count)
  }, [needs, groupBy])

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const expandAll = () => {
    setExpandedGroups(new Set(groups.map((g) => g.name)))
  }

  const collapseAll = () => {
    setExpandedGroups(new Set())
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorias</h1>
          <p className="text-sm text-slate-500 mt-1">
            {groups.length} categorias de {needs.length} needs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button
              onClick={expandAll}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
            >
              Expandir
            </button>
            <button
              onClick={collapseAll}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
            >
              Recolher
            </button>
          </div>
          <select
            value={groupBy}
            onChange={(e) => {
              setGroupBy(e.target.value as GroupByKey)
              setExpandedGroups(new Set())
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white cursor-pointer"
          >
            <option value="cluster">Por Cluster</option>
            <option value="type">Por Tipo</option>
            <option value="name">Por Membro</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.name)
          const color = groupBy === 'cluster' ? getClusterColor(group.name) : '#64748B'

          return (
            <div
              key={group.name}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown size={16} className="text-slate-400" />
                ) : (
                  <ChevronRight size={16} className="text-slate-400" />
                )}

                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: color }}
                />

                <span className="font-semibold text-sm text-slate-800 flex-1">
                  {group.name}
                </span>

                <span className="text-xs text-slate-400">
                  Pot. média: {group.avgPotential.toFixed(1)}
                </span>

                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  {group.count}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">
                  {group.items.map((need) => (
                    <div
                      key={need.id}
                      onClick={() => navigate(`/need/${need.id}`)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors pl-11"
                    >
                      <PotentialDots potential={need.potential} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 line-clamp-1">
                          {need.problem || need.observation}
                        </p>
                        {need.needStatement && (
                          <p className="text-xs text-slate-400 italic line-clamp-1 mt-0.5">
                            "{need.needStatement}"
                          </p>
                        )}
                      </div>
                      {groupBy !== 'cluster' && need.cluster && (
                        <ClusterBadge cluster={need.cluster} />
                      )}
                      {groupBy !== 'name' && need.name && (
                        <span className="text-xs text-slate-400">{need.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
