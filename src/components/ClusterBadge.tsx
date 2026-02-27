import { getClusterColor } from '../lib/colors'

interface Props {
  cluster: string
  size?: 'sm' | 'md'
}

export function ClusterBadge({ cluster, size = 'sm' }: Props) {
  if (!cluster) return null
  const color = getClusterColor(cluster)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {cluster}
    </span>
  )
}
