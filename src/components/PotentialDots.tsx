import { useState } from 'react'
import { getPotentialColor } from '../lib/colors'

interface Props {
  potential: number
  showLabel?: boolean
  editable?: boolean
  onPotentialChange?: (value: number) => void
}

export function PotentialDots({ potential, showLabel = false, editable = false, onPotentialChange }: Props) {
  const [localPotential, setLocalPotential] = useState(potential)
  const [hovered, setHovered] = useState<number | null>(null)

  // Sync from parent prop when it changes
  if (localPotential !== potential) {
    setLocalPotential(potential)
  }

  const activePotential = hovered !== null ? hovered : localPotential
  const activeColor = getPotentialColor(activePotential)

  return (
    <div
      className={`flex items-center gap-1.5 ${editable ? 'cursor-pointer' : ''}`}
      onMouseLeave={() => editable && setHovered(null)}
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full transition-all ${
            editable ? 'hover:scale-150' : ''
          }`}
          style={{
            backgroundColor: i <= activePotential ? activeColor : '#E2E8F0',
          }}
          onMouseEnter={() => editable && setHovered(i)}
          onClick={(e) => {
            if (!editable) return
            e.stopPropagation()
            setLocalPotential(i)
            setHovered(null)
            onPotentialChange?.(i)
          }}
        />
      ))}
      {showLabel && (
        <span className="text-xs text-slate-500 ml-1">{localPotential}/3</span>
      )}
    </div>
  )
}
