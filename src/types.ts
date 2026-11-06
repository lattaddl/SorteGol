export type LeagueId =
  | 'EPL' | 'LAL' | 'HYP' | 'SEA' | 'LI1' | 'BUN' | 'ARG'
  | 'NED' | 'POR' | 'BRA' | 'MLS' | 'SAU' | 'OTR'

export interface Team {
  id: string
  name: string
  league: LeagueId
  ovr: number
}

export type Balance = 'estricto' | 'parejo' | 'libre'
export type Format = 'liga' | 'copa' | 'mundial' | 'champions'

export interface Participant {
  id: string
  name: string
  team: Team
}

export type Slot =
  | { t: 'p'; pid: string }
  | { t: 'w'; m: string }
  | { t: 'r'; rank: number }
  | { t: 'g'; g: string; pos: number }

export interface Match {
  id: string
  stage: 'liga' | 'grupo' | 'fase' | 'ko'
  label: string
  group?: string
  home: Slot
  away: Slot
  hg?: number | null
  ag?: number | null
  hp?: number | null
  ap?: number | null
}

export interface Tournament {
  id: string
  format: Format
  createdAt: number
  double: boolean
  participants: Participant[]
  groups?: { name: string; pids: string[] }[]
  matches: Match[]
}

export interface HistoryEntry {
  id: string
  at: number
  aTeam: string
  bTeam: string
  aPlayer: string
  bPlayer: string
  spread: number
}
