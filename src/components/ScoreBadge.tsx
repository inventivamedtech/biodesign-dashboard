interface Props {
  value: number
  max?: number
  label?: string
  color?: string
}

export function ScoreBadge({ value, max = 3, label, color }: Props) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const bg = color || (pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : pct >= 25 ? '#F97316' : '#94A3B8')

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-slate-500 min-w-[60px]">{label}</span>}
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: bg }}
        />
      </div>
      <span className="text-xs font-mono text-slate-600 min-w-[24px] text-right">
        {value}
      </span>
    </div>
  )
}
