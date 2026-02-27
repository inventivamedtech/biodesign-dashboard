import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '../data/store'
import { ClusterBadge } from '../components/ClusterBadge'
import { PotentialDots } from '../components/PotentialDots'
import { NeedCard } from '../components/NeedCard'
import { ArrowLeft, User, Target, Users, Lightbulb, FileText, ArrowRight } from 'lucide-react'

export function NeedDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { needs } = useDataStore()

  const need = useMemo(() => needs.find((n) => n.id === id), [needs, id])

  const siblingNeeds = useMemo(() => {
    if (!need || !need.idMae) return []
    return needs.filter((n) => n.id !== need.id && n.idMae === need.idMae)
  }, [needs, need])

  const relatedNeeds = useMemo(() => {
    if (!need) return []
    const siblingIds = new Set(siblingNeeds.map((n) => n.id))
    return needs.filter(
      (n) =>
        n.id !== need.id &&
        !siblingIds.has(n.id) &&
        n.cluster === need.cluster
    ).slice(0, 6)
  }, [needs, need, siblingNeeds])

  if (!need) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <p className="text-lg mb-2">Need não encontrada</p>
        <button
          onClick={() => navigate('/needs')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Voltar para Needs
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-[11px] font-mono px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-semibold">
              {need.idFilha}
            </span>
            {need.idMae && (
              <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                mae: {need.idMae}
              </span>
            )}
            <PotentialDots potential={need.potential} showLabel />
            <ClusterBadge cluster={need.cluster} size="md" />
            {need.name && (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                <User size={14} />
                {need.name}
              </span>
            )}
            {need.source === 'upload' && (
              <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                upload
              </span>
            )}
          </div>

          {need.type && (
            <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium mb-3">
              {need.type}
            </span>
          )}
        </div>

        {/* Content flow */}
        <div className="p-6 space-y-5">
          {/* Observation */}
          <DetailSection
            icon={<Target size={16} />}
            label="Observação"
            color="#2563EB"
          >
            <p className="text-sm text-slate-700 leading-relaxed">{need.observation}</p>
          </DetailSection>

          {need.problem && (
            <>
              <div className="flex justify-center">
                <ArrowRight size={16} className="text-slate-300 rotate-90" />
              </div>
              <DetailSection
                icon={<Lightbulb size={16} />}
                label="Problema"
                color="#EF4444"
              >
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {need.problem}
                </p>
              </DetailSection>
            </>
          )}

          {need.population && (
            <>
              <div className="flex justify-center">
                <ArrowRight size={16} className="text-slate-300 rotate-90" />
              </div>
              <DetailSection
                icon={<Users size={16} />}
                label="População"
                color="#059669"
              >
                <p className="text-sm text-slate-700">{need.population}</p>
              </DetailSection>
            </>
          )}

          {need.intendedOutcome && (
            <>
              <div className="flex justify-center">
                <ArrowRight size={16} className="text-slate-300 rotate-90" />
              </div>
              <DetailSection
                icon={<Target size={16} />}
                label="Resultado esperado"
                color="#7C3AED"
              >
                <p className="text-sm text-slate-700">{need.intendedOutcome}</p>
              </DetailSection>
            </>
          )}

          {need.needStatement && (
            <>
              <div className="flex justify-center">
                <ArrowRight size={16} className="text-slate-300 rotate-90" />
              </div>
              <DetailSection
                icon={<FileText size={16} />}
                label="Need Statement"
                color="#0891B2"
              >
                <blockquote className="text-sm text-slate-700 italic border-l-3 border-cyan-300 pl-4 leading-relaxed">
                  "{need.needStatement}"
                </blockquote>
              </DetailSection>
            </>
          )}
        </div>
      </div>

      {/* Sibling needs (same idMae) */}
      {siblingNeeds.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            Needs irmas
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
              {need.idMae}
            </span>
            <span className="text-xs font-normal text-slate-400">({siblingNeeds.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {siblingNeeds.map((n) => (
              <NeedCard key={n.id} need={n} compact />
            ))}
          </div>
        </div>
      )}

      {/* Related needs (same cluster) */}
      {relatedNeeds.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Needs do mesmo cluster ({relatedNeeds.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relatedNeeds.map((n) => (
              <NeedCard key={n.id} need={n} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailSection({
  icon,
  label,
  color,
  children,
}: {
  icon: React.ReactNode
  label: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: `${color}06` }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}
