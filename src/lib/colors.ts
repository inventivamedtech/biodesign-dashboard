export const CLUSTER_COLORS: Record<string, string> = {
  'Respiratorio': '#2563EB',
  'Medicamentos': '#7C3AED',
  'Monitoramento': '#0891B2',
  'Cateter': '#D97706',
  'Derme': '#E11D48',
  'Comunicação': '#059669',
  'Mobilidade': '#6366F1',
  'Banho': '#14B8A6',
  'Agitação; Estresse': '#F97316',
  'Equipamentos/monitorização': '#8B5CF6',
  'Infraestrutura': '#64748B',
  'Educacao': '#84CC16',
  'Type': '#94A3B8',
}

export const TYPE_COLORS: Record<string, string> = {
  'Dispositivos': '#2563EB',
  'Infraestrutura': '#64748B',
  'Procedimentos': '#7C3AED',
  'CERNER': '#0891B2',
  'Equipamentos': '#D97706',
  'Equipamentos/monitorização': '#8B5CF6',
  'Erros de processos': '#EF4444',
  'Fixação e cateteres': '#F97316',
  'Medicamentos': '#059669',
  'Comunicação': '#14B8A6',
  'Oxímetro': '#6366F1',
  'Patologias': '#E11D48',
  'Punção e cateteres': '#D97706',
  'Mobilidade': '#84CC16',
}

export const POTENTIAL_COLORS: Record<number, string> = {
  0: '#CBD5E1',
  1: '#FBBF24',
  2: '#F97316',
  3: '#EF4444',
}

export function getClusterColor(cluster: string): string {
  return CLUSTER_COLORS[cluster] || '#94A3B8'
}

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] || '#94A3B8'
}

export function getPotentialColor(potential: number): string {
  return POTENTIAL_COLORS[potential] || '#CBD5E1'
}
