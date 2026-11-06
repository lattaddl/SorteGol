import { useMemo, useState } from 'react'
import type { Balance, HistoryEntry, LeagueId, Team } from './types'
import { TEAMS } from './teams'
import { TOLERANCE, pickBand, type Band } from './draw'
import { useStored } from './storage'
import { BalancePicker, Button, LeagueChips, PageTitle } from './ui'
import { TeamReveal } from './Reel'

interface Duel {
  a: Team
  b: Team
  spread: number
  widened: boolean
}

export default function MatchPage() {
  const [names, setNames] = useStored<[string, string]>('match.names', ['Jugador 1', 'Jugador 2'])
  const [leagues, setLeagues] = useStored<LeagueId[]>('match.leagues', [])
  const [balance, setBalance] = useStored<Balance>('match.balance', 'parejo')
  const [duel, setDuel] = useStored<Duel | null>('match.duel', null)
  const [history, setHistory] = useStored<HistoryEntry[]>('match.history', [])
  const [run, setRun] = useState(0)
  const [error, setError] = useState('')

  const pool = useMemo(() => TEAMS.filter((t) => leagues.length === 0 || leagues.includes(t.league)), [leagues])
  const nameA = names[0].trim() || 'Jugador 1'
  const nameB = names[1].trim() || 'Jugador 2'

  const draw = () => {
    let band: Band | null = null
    for (let i = 0; i < 10; i++) {
      band = pickBand(pool, 2, TOLERANCE[balance])
      if (!band) break
      const ids = band.teams.map((t) => t.id)
      if (!duel || !(ids.includes(duel.a.id) || ids.includes(duel.b.id))) break
    }
    if (!band) {
      setError('Con esos filtros hay menos de 2 equipos. Sumá más ligas.')
      return
    }
    setError('')
    const [a, b] = band.teams
    const spread = band.spread
    setDuel({ a, b, spread, widened: band.widened })
    setRun((r) => r + 1)
    setHistory((h) =>
      [{ id: `${Date.now()}`, at: Date.now(), aTeam: a.name, bTeam: b.name, aPlayer: nameA, bPlayer: nameB, spread }, ...h].slice(0, 8),
    )
  }

  const swap = () => duel && setDuel({ ...duel, a: duel.b, b: duel.a })

  return (
    <div>
      <PageTitle title="Sorteá el partido">
        Dos equipos con valoraciones parecidas, para que el resultado se decida en la cancha y no en el sorteo.
      </PageTitle>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <section className="card space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="label">Jugador 1</span>
              <input className="input" maxLength={18} value={names[0]} onChange={(e) => setNames([e.target.value, names[1]])} />
            </label>
            <label>
              <span className="label">Jugador 2</span>
              <input className="input" maxLength={18} value={names[1]} onChange={(e) => setNames([names[0], e.target.value])} />
            </label>
          </div>
          <div>
            <span className="label">Diferencia entre equipos</span>
            <BalancePicker value={balance} onChange={setBalance} />
          </div>
          <div>
            <span className="label">Ligas</span>
            <LeagueChips value={leagues} onChange={setLeagues} />
            <p className="mt-2 text-sm text-white/55">{pool.length} equipos en juego</p>
          </div>
          <Button className="w-full py-4 text-lg" onClick={draw}>
            {duel ? 'Sortear de nuevo' : 'Sortear partido'}
          </Button>
          {error && <p role="alert" className="text-sm text-cielo-300">{error}</p>}
        </section>

        <section>
          {duel ? (
            <div>
              <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
                <TeamReveal team={duel.a} player={nameA} pool={pool} run={run} lockAfter={1300} />
                <div className="flex items-center justify-center">
                  <span className="font-display text-5xl font-black text-white/25 md:text-6xl">VS</span>
                </div>
                <TeamReveal team={duel.b} player={nameB} pool={pool} run={run} lockAfter={2000} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-white/65">
                  Diferencia de valoración: <b className="text-white">{duel.spread}</b>
                  {duel.widened && ' · se amplió el rango porque los filtros dejan pocos equipos'}
                </p>
                <Button variant="ghost" small onClick={swap}>Intercambiar equipos</Button>
              </div>
            </div>
          ) : (
            <div className="card flex min-h-[340px] flex-col items-center justify-center p-8 text-center">
              <p className="font-display text-3xl font-extrabold">Todavía no hay partido</p>
              <p className="mt-2 max-w-sm text-white/60">Poné los nombres, elegí qué tan parejo lo querés y tocá “Sortear partido”.</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="card mt-6 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-2xl font-extrabold">Últimos sorteos</h2>
                <Button variant="ghost" small onClick={() => setHistory([])}>Borrar historial</Button>
              </div>
              <ul className="divide-y divide-white/10">
                {history.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                    <span>
                      <b>{h.aTeam}</b> <span className="text-white/45">({h.aPlayer})</span> <span className="text-white/45">vs</span>{' '}
                      <b>{h.bTeam}</b> <span className="text-white/45">({h.bPlayer})</span>
                    </span>
                    <span className="text-white/45">dif. {h.spread}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
