import { PotentialDots } from './PotentialDots'
import { getTypeColor } from '../lib/colors'
import type { Observation } from '../data/types'

interface Props {
  observation: Observation
  onClick?: () => void
}

export function ObservationCard({ observation, onClick }: Props) {
  const typeColor = getTypeColor(observation.type)

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all hover:border-slate-300 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
            {observation.idMae}
          </span>
          <PotentialDots potential={observation.potential} showLabel />
        </div>
        {observation.source === 'upload' && (
          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
            upload
          </span>
        )}
      </div>

      <p className="text-sm text-slate-700 leading-relaxed mb-3">
        {observation.observation}
      </p>

      {observation.type && (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${typeColor}15`,
            color: typeColor,
          }}
        >
          {observation.type}
        </span>
      )}
    </div>
  )
}
