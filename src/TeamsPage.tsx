import { useMemo, useState } from 'react'
import type { LeagueId } from './types'
import { LEAGUE_NAME, TEAMS, starsFor } from './teams'
import { LeagueChips, PageTitle, Segmented, Stars } from './ui'
import { TeamBadge } from './TeamBadge'

export default function TeamsPage() {
  const [q, setQ] = useState('')
  const [leagues, setLeagues] = useState<LeagueId[]>([])
  const [sort, setSort] = useState<'ovr' | 'az'>('ovr')

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return TEAMS.filter((t) => (leagues.length === 0 || leagues.includes(t.league)) && t.name.toLowerCase().includes(term)).sort(
      (a, b) => (sort === 'ovr' ? b.ovr - a.ovr || a.name.localeCompare(b.name) : a.name.localeCompare(b.name)),
    )
  }, [q, leagues, sort])

  return (
    <div>
      <PageTitle title="Equipos">
        {TEAMS.length} equipos de las ligas más fuertes del mundo, con su valoración.
      </PageTitle>

      <div className="card mb-6 space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input className="input sm:max-w-xs" placeholder="Buscar equipo" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar equipo" />
          <Segmented
            className="sm:w-64"
            value={sort}
            onChange={setSort}
            options={[{ id: 'ovr', label: 'Por valoración' }, { id: 'az', label: 'A–Z' }]}
          />
        </div>
        <LeagueChips value={leagues} onChange={setLeagues} />
      </div>

      <p className="mb-3 text-sm text-white/55">{list.length} equipos</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <li key={t.id} className="card flex items-center gap-4 p-3.5 transition hover:border-cielo/40">
            <TeamBadge team={t} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{t.name}</p>
              <p className="truncate text-xs text-white/50">{LEAGUE_NAME[t.league]}</p>
              <div className="mt-1"><Stars value={starsFor(t.ovr)} size={12} /></div>
            </div>
            <span className="font-display text-3xl font-black tabular-nums text-cielo">{t.ovr}</span>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="card p-8 text-center text-white/60">No hay equipos con ese filtro.</p>}
    </div>
  )
}
