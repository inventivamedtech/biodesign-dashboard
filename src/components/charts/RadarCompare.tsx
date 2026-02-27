import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { Need } from '../../data/types'

const COMPARE_COLORS = ['#2563EB', '#7C3AED', '#059669', '#D97706']

interface Props {
  needs: Need[]
}

export function RadarCompare({ needs }: Props) {
  if (needs.length === 0) return null

  const dimensions = [
    { key: 'potential', label: 'Potencial', max: 3 },
  ]

  const data = dimensions.map((dim) => {
    const point: Record<string, string | number> = { dimension: dim.label }
    needs.forEach((need, i) => {
      const raw = (need as unknown as Record<string, unknown>)[dim.key]
      const value = typeof raw === 'number' ? raw : 0
      point[`need${i}`] = dim.max > 0 ? (value / dim.max) * 100 : 0
    })
    return point
  })

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#E2E8F0" />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#64748B' }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
          {needs.map((need, i) => (
            <Radar
              key={need.id}
              name={need.observation.substring(0, 30) + '...'}
              dataKey={`need${i}`}
              stroke={COMPARE_COLORS[i]}
              fill={COMPARE_COLORS[i]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: '11px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
