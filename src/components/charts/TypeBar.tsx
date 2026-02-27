import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getTypeColor } from '../../lib/colors'

interface Props {
  data: { name: string; value: number }[]
}

export function TypeBar({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.value - a.value)

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ left: 0, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 12, fill: '#64748B' }}
          />
          <Tooltip
            formatter={(value?: number) => [`${value}`, 'Quantidade']}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
            {sorted.map((entry) => (
              <Cell key={entry.name} fill={getTypeColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
