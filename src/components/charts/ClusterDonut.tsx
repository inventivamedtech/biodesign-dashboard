import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { getClusterColor } from '../../lib/colors'

interface Props {
  data: { name: string; value: number }[]
}

export function ClusterDonut({ data }: Props) {
  return (
    <div className="flex items-center gap-6">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={getClusterColor(entry.name)}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} needs`, name]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-1.5">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: getClusterColor(item.name) }}
            />
            <span className="text-xs text-slate-600">{item.name}</span>
            <span className="text-xs font-mono text-slate-400">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
