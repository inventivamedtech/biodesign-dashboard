export interface Observation {
  id: string
  idMae: string
  potential: number
  type: string
  observation: string
  source: 'sheets' | 'upload'
}

export interface Need {
  id: string
  idFilha: string
  idMae: string
  name: string
  potential: number
  type: string
  observation: string
  problem: string
  population: string
  intendedOutcome: string
  needStatement: string
  cluster: string
  source: 'sheets' | 'upload'
}

export type GroupByKey = 'cluster' | 'type' | 'name'
export type SortKey = 'potential' | 'cluster' | 'name' | 'type' | 'alphabetical'
