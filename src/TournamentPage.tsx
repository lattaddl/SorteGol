import { useMemo, useState } from 'react'
import type { Balance, Format, LeagueId, Tournament } from './types'
import { TEAMS } from './teams'
import { TOLERANCE, pickBand } from './draw'
import { FORMATS, createTournament } from './tournament'
import { useStored } from './storage'
import { BalancePicker, Button, LeagueChips, PageTitle } from './ui'
import TournamentView from './TournamentView'

const DEFAULT_NAMES = ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4']

export default function TournamentPage() {
  const [tournament, setTournament] = useStored<Tournament | null>('tournament', null)
  const [format, setFormat] = useStored<Format>('tournament.format', 'liga')
  const [names, setNames] = useStored<string[]>('tournament.names', DEFAULT_NAMES)
  const [leagues, setLeagues] = useStored<LeagueId[]>('tournament.leagues', [])
  const [balance, setBalance] = useStored<Balance>('tournament.balance', 'parejo')
  const [double, setDouble] = useStored<boolean>('tournament.double', false)
  const [creating, setCreating] = useState(false)
  const [reveal, setReveal] = useState(0)
  const [error, setError] = useState('')

  const info = FORMATS.find((f) => f.id === format)!
  const pool = useMemo(() => TEAMS.filter((t) => leagues.length === 0 || leagues.includes(t.league)), [leagues])

  const n = names.length
  let problem = ''
  if (n < info.min) problem = `${info.name} necesita al menos ${info.min} jugadores.`
  else if (n > info.max) problem = `${info.name} admite hasta ${info.max} jugadores.`
  else if (info.even && n % 2) problem = `${info.name} necesita una cantidad par de jugadores.`

  const setName = (i: number, v: string) => setNames(names.map((x, k) => (k === i ? v : x)))

  const draw = () => {
    const band = pickBand(pool, n, TOLERANCE[balance])
    if (!band) {
      setError(`Con esas ligas no alcanzan ${n} equipos. Sumá más ligas.`)
      return
    }
    setError('')
    const t = createTournament(format, names, band.teams, double)
    setTournament(t)
    setReveal((r) => r + 1)
    setCreating(false)
  }

  if (tournament && !creating) {
    return (
      <TournamentView
        t={tournament}
        pool={pool}
        reveal={reveal}
        onChange={setTournament}
        onNew={() => setCreating(true)}
      />
    )
  }

  return (
    <div>
      <PageTitle title="Armá el torneo">
        Cada jugador recibe un equipo de nivel parecido y el fixture se arma solo, con los formatos del FC 26.
      </PageTitle>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <span className="label">Formato</span>
            <div className="grid gap-3 sm:grid-cols-2">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  aria-pressed={format === f.id}
                  className={`rounded-xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cielo ${
                    format === f.id ? 'border-cielo bg-mar/40 shadow-[0_10px_30px_-12px_rgba(63,122,224,.9)]' : 'border-white/10 bg-white/[.04] hover:border-white/30'
                  }`}
                >
                  <p className="font-display text-2xl font-extrabold">{f.name}</p>
                  <p className="mt-1 text-sm text-white/65">{f.desc}</p>
                  <p className="mt-2 text-xs text-white/45">{f.min} a {f.max} jugadores{f.even ? ', cantidad par' : ''}</p>
                </button>
              ))}
            </div>
            {format === 'liga' && (
              <label className="mt-5 flex cursor-pointer items-center gap-3">
                <input type="checkbox" className="h-5 w-5 accent-[#3f7ae0]" checked={double} onChange={(e) => setDouble(e.target.checked)} />
                <span>Ida y vuelta</span>
              </label>
            )}
          </section>

          <section className="card p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="label !mb-0">Jugadores ({n})</span>
              <div className="flex gap-2">
                <Button variant="ghost" small disabled={n >= 32} onClick={() => setNames([...names, `Jugador ${n + 1}`])}>Agregar</Button>
              </div>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {names.map((v, i) => (
                <li key={i} className="flex gap-2 animate-pop">
                  <input className="input" maxLength={18} value={v} aria-label={`Jugador ${i + 1}`} onChange={(e) => setName(i, e.target.value)} />
                  <button
                    aria-label={`Quitar jugador ${i + 1}`}
                    disabled={n <= 2}
                    onClick={() => setNames(names.filter((_, k) => k !== i))}
                    className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-lg border border-white/10 bg-tinta/60 text-white/60 transition hover:border-cielo/60 hover:text-white active:scale-90 disabled:opacity-30"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="card h-fit space-y-6 p-5 sm:p-6">
          <div>
            <span className="label">Diferencia entre equipos</span>
            <BalancePicker value={balance} onChange={setBalance} />
          </div>
          <div>
            <span className="label">Ligas</span>
            <LeagueChips value={leagues} onChange={setLeagues} />
            <p className="mt-2 text-sm text-white/55">{pool.length} equipos en juego</p>
          </div>
          {(problem || error) && <p role="alert" className="text-sm text-cielo-300">{problem || error}</p>}
          <Button className="w-full py-4 text-lg" disabled={!!problem} onClick={draw}>Sortear torneo</Button>
          {tournament && <Button variant="ghost" className="w-full" onClick={() => setCreating(false)}>Volver al torneo en curso</Button>}
        </section>
      </div>
    </div>
  )
}
