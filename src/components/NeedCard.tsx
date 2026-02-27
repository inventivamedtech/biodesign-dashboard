import { useNavigate } from 'react-router-dom'
import { ClusterBadge } from './ClusterBadge'
import { PotentialDots } from './PotentialDots'
import { User, ArrowRight } from 'lucide-react'
import type { Need } from '../data/types'

interface Props {
  need: Need
  compact?: boolean
  showCheckbox?: boolean
  checked?: boolean
  onCheckChange?: (checked: boolean) => void
}

export function NeedCard({ need, compact, showCheckbox, checked, onCheckChange }: Props) {
  const navigate = useNavigate()

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all hover:border-slate-300 ${
        compact ? 'p-3' : 'p-4'
      } ${checked ? 'ring-2 ring-blue-500 border-blue-300' : ''}`}
    >
      <div className="flex items-start gap-3">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckChange?.(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-purple-50 text-purple-500 rounded">
              {need.idFilha}
            </span>
            {need.idMae && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded">
                {need.idMae}
              </span>
            )}
            <PotentialDots potential={need.potential} />
            <ClusterBadge cluster={need.cluster} />
            {need.name && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <User size={12} />
                {need.name}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-600 mb-2 line-clamp-2">
            {need.observation}
          </p>

          {need.problem && !compact && (
            <div className="flex items-start gap-2 mb-2">
              <ArrowRight size={14} className="text-slate-400 mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-slate-800">{need.problem}</p>
            </div>
          )}

          {need.needStatement && (
            <p
              className={`text-xs text-slate-500 italic ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}
            >
              "{need.needStatement}"
            </p>
          )}

          {!compact && (
            <button
              onClick={() => navigate(`/need/${need.id}`)}
              className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver detalhes
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
