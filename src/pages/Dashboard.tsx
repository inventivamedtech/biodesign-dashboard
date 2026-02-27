import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, FileText, Layers, Upload } from 'lucide-react'
import { useDataStore } from '../data/store'
import { ClusterDonut } from '../components/charts/ClusterDonut'
import { TypeBar } from '../components/charts/TypeBar'
import { ClusterBadge } from '../components/ClusterBadge'
import { PotentialDots } from '../components/PotentialDots'

export function Dashboard() {
  const { observations, needs } = useDataStore()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const clusterCounts = new Map<string, number>()
    needs.forEach((n) => {
      if (n.cluster) {
        clusterCounts.set(n.cluster, (clusterCounts.get(n.cluster) || 0) + 1)
      }
    })

    const typeCounts = new Map<string, number>()
    observations.forEach((o) => {
      if (o.type) {
        typeCounts.set(o.type, (typeCounts.get(o.type) || 0) + 1)
      }
    })

    const members = new Set(needs.map((n) => n.name).filter(Boolean))

    const clusterData = [...clusterCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const typeData = [...typeCounts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const topNeeds = [...needs]
      .sort((a, b) => b.potential - a.potential)
      .slice(0, 5)

    return {
      totalObs: observations.length,
      totalNeeds: needs.length,
      totalClusters: clusterCounts.size,
      totalMembers: members.size,
      clusterData,
      typeData,
      topNeeds,
    }
  }, [observations, needs])

  if (observations.length === 0 && needs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Upload size={32} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Nenhum dado carregado</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-md">
          Faça upload de um arquivo .xlsx com as observações e needs do Biodesign, ou configure uma URL do Google Sheets.
        </p>
        <button
          onClick={() => navigate('/data')}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload size={16} />
          Carregar dados
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Visão geral do processo Biodesign</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          icon={<Eye size={20} />}
          label="Observações"
          value={stats.totalObs}
          color="#2563EB"
          onClick={() => navigate('/observations')}
        />
        <MetricCard
          icon={<FileText size={20} />}
          label="Needs Stage 0"
          value={stats.totalNeeds}
          color="#7C3AED"
          onClick={() => navigate('/needs')}
        />
        <MetricCard
          icon={<Layers size={20} />}
          label="Clusters"
          value={stats.totalClusters}
          color="#0891B2"
          onClick={() => navigate('/categories')}
        />
        <MetricCard
          icon={<span className="text-lg">👥</span>}
          label="Membros"
          value={stats.totalMembers}
          color="#059669"
        />
      </div>

      {/* Funnel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Pipeline Biodesign</h3>
        <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-3">
          <FunnelStep
            label="Observações"
            count={stats.totalObs}
            color="#2563EB"
            active
          />
          <FunnelStep
            label="Needs Stage 0"
            count={stats.totalNeeds}
            color="#7C3AED"
            active
          />
          <FunnelStep
            label="Stage 1"
            count={0}
            color="#0891B2"
            active={false}
          />
          <FunnelStep
            label="Stage 2"
            count={0}
            color="#059669"
            active={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Cluster Distribution */}
        {stats.clusterData.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Distribuição por Cluster
            </h3>
            <ClusterDonut data={stats.clusterData} />
          </div>
        )}

        {/* Type Distribution */}
        {stats.typeData.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Tipos de Observação
            </h3>
            <TypeBar data={stats.typeData} />
          </div>
        )}
      </div>

      {/* Top Needs */}
      {stats.topNeeds.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Top 5 Needs (por potencial)
            </h3>
            <button
              onClick={() => navigate('/needs')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {stats.topNeeds.map((need, i) => (
              <div
                key={need.id}
                onClick={() => navigate(`/need/${need.id}`)}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <span className="text-xs font-mono text-slate-400 mt-0.5 w-5">
                  {i + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 line-clamp-1">
                    {need.problem || need.observation}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <PotentialDots potential={need.potential} />
                    <ClusterBadge cluster={need.cluster} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-4 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''
      } transition-all`}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function FunnelStep({
  label,
  count,
  color,
  active,
}: {
  label: string
  count: number
  color: string
  active: boolean
}) {
  return (
    <div
      className={`flex-1 p-3 rounded-lg border text-center transition-all ${
        active
          ? 'border-transparent'
          : 'border-dashed border-slate-300 opacity-40'
      }`}
      style={active ? { backgroundColor: `${color}08`, borderColor: `${color}30` } : {}}
    >
      <p
        className="text-xl font-bold"
        style={{ color: active ? color : '#94A3B8' }}
      >
        {count || '—'}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}
