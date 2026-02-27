import { getPotentialColor } from '../lib/colors'

interface Props {
  potential: number
  showLabel?: boolean
  editable?: boolean
  onPotentialChange?: (value: number) => void
}

export function PotentialDots({ potential, showLabel = false, editable = false, onPotentialChange }: Props) {
  const color = getPotentialColor(potential)

  if (editable) {
    return (
      <div className="flex items-center gap-1">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPotentialChange?.(i)
            }}
            className="w-6 h-6 rounded text-xs font-bold transition-all hover:scale-110"
            style={{
              backgroundColor: i === potential ? getPotentialColor(i) : '#F1F5F9',
              color: i === potential ? 'white' : '#94A3B8',
            }}
          >
            {i}
          </button>
        ))}
      </div>
    )
  }

  return (
    <span
      className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-bold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {potential}/3
      {showLabel && <span className="ml-1 text-slate-500 font-normal">potencial</span>}
    </span>
  )
}
