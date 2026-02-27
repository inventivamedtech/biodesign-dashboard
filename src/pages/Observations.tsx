import { useMemo, useState, Fragment, useRef, useEffect } from 'react'
import { useDataStore } from '../data/store'
import { FilterBar } from '../components/FilterBar'
import { PotentialDots } from '../components/PotentialDots'
import { getTypeColor } from '../lib/colors'
import { TYPE_COLORS } from '../lib/colors'
import {
  updateObservationPotentialInSheets,
  updateObservationTypeInSheets,
  updateObservationTextInSheets,
  addObservationToSheets,
} from '../data/sheetsWriter'
import { ChevronDown, ChevronRight, Plus, Check, X } from 'lucide-react'

const OBSERVATION_TYPES = Object.keys(TYPE_COLORS)

function getNextObsId(observations: { idMae: string }[]): string {
  let max = 0
  for (const o of observations) {
    const match = o.idMae.match(/^OBS-(\d+)$/)
    if (match) {
      const n = parseInt(match[1], 10)
      if (n > max) max = n
    }
  }
  return `OBS-${String(max + 1).padStart(3, '0')}`
}

export function Observations() {
  const { observations, needs, updateObservationPotential, updateObservationField, addObservation } = useDataStore()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [expandedObs, setExpandedObs] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newPotential, setNewPotential] = useState(0)
  const [newType, setNewType] = useState('')
  const [newObsText, setNewObsText] = useState('')
  const [saving, setSaving] = useState(false)

  // Inline editing state
  const [editingType, setEditingType] = useState<string | null>(null)
  const [editingObs, setEditingObs] = useState<string | null>(null)
  const [editObsValue, setEditObsValue] = useState('')
  const obsInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingObs && obsInputRef.current) {
      obsInputRef.current.focus()
      obsInputRef.current.select()
    }
  }, [editingObs])

  const filterDefs = useMemo(() => {
    const types = [...new Set(observations.map((o) => o.type).filter(Boolean))]
    const typeOptions = types.map((t) => ({
      value: t,
      label: t,
      count: observations.filter((o) => o.type === t).length,
    }))

    return [
      { key: 'type', label: 'Tipo', options: typeOptions },
      {
        key: 'potential',
        label: 'Potencial',
        options: [
          { value: '0', label: 'Potencial 0', count: observations.filter((o) => o.potential === 0).length },
          { value: '1', label: 'Potencial 1', count: observations.filter((o) => o.potential === 1).length },
          { value: '2', label: 'Potencial 2', count: observations.filter((o) => o.potential === 2).length },
          { value: '3', label: 'Potencial 3', count: observations.filter((o) => o.potential === 3).length },
        ],
      },
    ]
  }, [observations])

  const filtered = useMemo(() => {
    return observations.filter((o) => {
      if (search && !o.observation.toLowerCase().includes(search.toLowerCase())) return false
      if (filters.type && o.type !== filters.type) return false
      if (filters.potential && o.potential !== Number(filters.potential)) return false
      return true
    })
  }, [observations, search, filters])

  const derivedNeeds = useMemo(() => {
    if (!expandedObs) return []
    const obs = observations.find((o) => o.id === expandedObs)
    if (!obs) return []
    return needs.filter((n) => n.idMae === obs.idMae)
  }, [expandedObs, observations, needs])

  const needCountMap = useMemo(() => {
    const map = new Map<string, number>()
    needs.forEach((n) => {
      if (n.idMae) map.set(n.idMae, (map.get(n.idMae) || 0) + 1)
    })
    return map
  }, [needs])

  const nextId = useMemo(() => getNextObsId(observations), [observations])

  function handleOpenForm() {
    setNewPotential(0)
    setNewType('')
    setNewObsText('')
    setShowForm(true)
  }

  async function handleSave() {
    if (!newObsText.trim()) return

    const idMae = nextId
    const obs = {
      id: idMae,
      idMae,
      potential: newPotential,
      type: newType,
      observation: newObsText.trim(),
      source: 'sheets' as const,
    }

    addObservation(obs)
    setShowForm(false)

    setSaving(true)
    await addObservationToSheets({
      idMae,
      potential: newPotential,
      type: newType,
      observation: newObsText.trim(),
    })
    setSaving(false)
  }

  function handleTypeChange(o: { id: string; idMae: string }, newVal: string) {
    setEditingType(null)
    updateObservationField(o.id, 'type', newVal)
    updateObservationTypeInSheets(o.idMae, newVal)
  }

  function handleObsSave(o: { id: string; idMae: string }) {
    const trimmed = editObsValue.trim()
    if (!trimmed) return
    setEditingObs(null)
    updateObservationField(o.id, 'observation', trimmed)
    updateObservationTextInSheets(o.idMae, trimmed)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Observações</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} de {observations.length} observações
          </p>
        </div>
        <button
          onClick={handleOpenForm}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nova Observação
        </button>
      </div>

      <FilterBar
        filters={filterDefs}
        activeFilters={filters}
        onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar observação..."
      />

      {saving && (
        <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          Salvando no Google Sheets...
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-8 px-3 py-3"></th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Potencial</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-36">Tipo</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Observação</th>
            </tr>
          </thead>
          <tbody>
            {showForm && (
              <tr className="border-b border-blue-200 bg-blue-50/60">
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3">
                  <span className="font-mono text-[11px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                    {nextId}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <PotentialDots
                    potential={newPotential}
                    editable
                    onPotentialChange={setNewPotential}
                  />
                </td>
                <td className="px-3 py-3">
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="">Selecionar tipo...</option>
                    {OBSERVATION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newObsText}
                      onChange={(e) => setNewObsText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave()
                        if (e.key === 'Escape') setShowForm(false)
                      }}
                      placeholder="Descreva a observação..."
                      className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      autoFocus
                    />
                    <button
                      onClick={handleSave}
                      disabled={!newObsText.trim()}
                      className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Salvar"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                      title="Cancelar"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((o) => {
              const isExpanded = expandedObs === o.id
              const needCount = needCountMap.get(o.idMae) || 0
              const typeColor = getTypeColor(o.type)
              const isEditingThisType = editingType === o.id
              const isEditingThisObs = editingObs === o.id

              return (
                <Fragment key={o.id}>
                  <tr
                    onClick={() => setExpandedObs(isExpanded ? null : o.id)}
                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                      isExpanded ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="px-3 py-3 text-slate-400">
                      {needCount > 0 ? (
                        isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                      ) : (
                        <span className="w-3.5 block" />
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                        {o.idMae}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <PotentialDots
                        potential={o.potential}
                        editable
                        onPotentialChange={(val) => {
                          updateObservationPotential(o.id, val)
                          updateObservationPotentialInSheets(o.idMae, val)
                        }}
                      />
                    </td>
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      {isEditingThisType ? (
                        <select
                          value={o.type}
                          onChange={(e) => handleTypeChange(o, e.target.value)}
                          onBlur={() => setEditingType(null)}
                          autoFocus
                          className="w-full text-xs border border-blue-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          <option value="">Sem tipo</option>
                          {OBSERVATION_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      ) : (
                        <span
                          onClick={() => setEditingType(o.id)}
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                          style={o.type ? { backgroundColor: `${typeColor}15`, color: typeColor } : { color: '#94A3B8' }}
                          title="Clique para editar"
                        >
                          {o.type || '+ tipo'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-700" onClick={(e) => e.stopPropagation()}>
                      {isEditingThisObs ? (
                        <div className="flex items-start gap-1">
                          <textarea
                            ref={obsInputRef}
                            value={editObsValue}
                            onChange={(e) => setEditObsValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleObsSave(o)
                              }
                              if (e.key === 'Escape') setEditingObs(null)
                            }}
                            className="flex-1 text-xs border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                            rows={2}
                          />
                          <button
                            onClick={() => handleObsSave(o)}
                            className="p-0.5 text-green-600 hover:bg-green-50 rounded mt-0.5"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingObs(null)}
                            className="p-0.5 text-slate-400 hover:bg-slate-100 rounded mt-0.5"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => {
                            setEditingObs(o.id)
                            setEditObsValue(o.observation)
                          }}
                          className="line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                          title="Clique para editar"
                        >
                          {o.observation || '+ observação'}
                          {needCount > 0 && (
                            <span
                              className="ml-2 text-[10px] text-blue-500 font-medium"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedObs(isExpanded ? null : o.id)
                              }}
                            >
                              {needCount} need{needCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && derivedNeeds.length > 0 && (
                    <tr>
                      <td colSpan={5} className="px-0 py-0">
                        <div className="bg-indigo-50/70 border-y border-indigo-100 px-6 py-3">
                          <p className="text-xs font-semibold text-indigo-700 mb-2">
                            Needs derivadas ({derivedNeeds.length})
                          </p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-indigo-400">
                                <th className="text-left py-1 pr-2 font-medium w-24">ID</th>
                                <th className="text-left py-1 pr-2 font-medium">Problema</th>
                                <th className="text-left py-1 pr-2 font-medium">Need Statement</th>
                                <th className="text-left py-1 font-medium w-28">Cluster</th>
                              </tr>
                            </thead>
                            <tbody>
                              {derivedNeeds.map((n) => (
                                <tr key={n.id} className="border-t border-indigo-100/50">
                                  <td className="py-1.5 pr-2">
                                    <span className="font-mono text-[10px] px-1 py-0.5 bg-purple-100 text-purple-600 rounded">
                                      {n.idFilha}
                                    </span>
                                  </td>
                                  <td className="py-1.5 pr-2 text-slate-700">{n.problem || '—'}</td>
                                  <td className="py-1.5 pr-2 text-slate-500 italic line-clamp-1">
                                    {n.needStatement ? `"${n.needStatement}"` : '—'}
                                  </td>
                                  <td className="py-1.5 text-slate-600">{n.cluster || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && !showForm && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg mb-1">Nenhuma observação encontrada</p>
            <p className="text-sm">Tente ajustar os filtros ou termos de busca</p>
          </div>
        )}
      </div>
    </div>
  )
}
