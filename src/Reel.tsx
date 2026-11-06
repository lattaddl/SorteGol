import { useLayoutEffect, useState } from 'react'
import type { Team } from './types'
import { LEAGUE_NAME, starsFor } from './teams'
import { TeamBadge } from './TeamBadge'
import { Stars } from './ui'

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface Props {
  team: Team
  player: string
  pool: Team[]
  /** Cada vez que cambia (y es > 0) el equipo "gira" antes de frenar. */
  run: number
  lockAfter?: number
  compact?: boolean
}

export function TeamReveal({ team, player, pool, run, lockAfter = 1400, compact = false }: Props) {
  const [shown, setShown] = useState<Team>(team)
  const [locked, setLocked] = useState(true)

  useLayoutEffect(() => {
    if (run === 0 || prefersReduced() || pool.length < 2) {
      setLocked(true)
      return
    }
    setLocked(false)
    const spin = window.setInterval(() => setShown(pool[Math.floor(Math.random() * pool.length)]), 75)
    const stop = window.setTimeout(() => {
      window.clearInterval(spin)
      setLocked(true)
    }, lockAfter)
    return () => {
      window.clearInterval(spin)
      window.clearTimeout(stop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])

  const t = locked ? team : shown

  if (compact) {
    return (
      <div className={`card relative flex items-center gap-4 overflow-hidden p-4 ${locked ? 'animate-lock' : ''}`}>
        <div className={locked ? '' : 'animate-flick'}>
          <TeamBadge team={t} size={52} />
        </div>
        <div className={`min-w-0 flex-1 ${locked ? '' : 'blur-[1.5px]'}`}>
          <p className="truncate text-sm text-white/60">{player}</p>
          <p className="truncate font-display text-2xl font-extrabold leading-tight">{t.name}</p>
          <p className="truncate text-xs text-white/50">{LEAGUE_NAME[t.league]}</p>
        </div>
        <span className="font-display text-4xl font-black tabular-nums text-cielo">{t.ovr}</span>
      </div>
    )
  }

  return (
    <div className={`card relative overflow-hidden p-6 text-center ${locked ? 'animate-lock' : ''}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cielo to-transparent" />
      <p className="text-sm font-semibold text-white/65">{player}</p>
      <div className={`mx-auto my-4 w-fit ${locked ? '' : 'animate-flick'}`}>
        <TeamBadge team={t} size={112} />
      </div>
      <h3
        className={`flex min-h-[3.2rem] items-center justify-center font-display text-4xl font-extrabold leading-none sm:text-5xl ${
          locked ? '' : 'blur-[1.5px]'
        }`}
      >
        {t.name}
      </h3>
      <p className="mt-2 text-white/60">{LEAGUE_NAME[t.league]}</p>
      <div className="mt-5 flex items-center justify-center gap-4">
        <span className="font-display text-6xl font-black tabular-nums leading-none text-cielo">{t.ovr}</span>
        <div className="text-left">
          <Stars value={starsFor(t.ovr)} />
          <p className="mt-1 text-xs text-white/50">Valoración</p>
        </div>
      </div>
    </div>
  )
}
