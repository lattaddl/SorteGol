import { useEffect, useMemo, useRef, useState } from 'react'
import type { Match, Participant, Slot, Team, Tournament } from './types'
import { champion, progress, resolve, slotLabel, tableFor } from './tournament'
import { Button, Segmented } from './ui'
import { TeamBadge } from './TeamBadge'
import { TeamReveal } from './Reel'
import { Confetti } from './Confetti'

type View = 'equipos' | 'tablas' | 'partidos' | 'cuadro'
type Patch = Partial<Pick<Match, 'hg' | 'ag' | 'hp' | 'ap'>>

interface Props {
  t: Tournament
  pool: Team[]
  reveal: number
  onChange: (t: Tournament) => void
  onNew: () => void
}

export default function TournamentView({ t, pool, reveal, onChange, onNew }: Props) {
  const [view, setView] = useState<View>('equipos')
  const [boom, setBoom] = useState(false)
  const pm = useMemo(() => Object.fromEntries(t.participants.map((p) => [p.id, p])) as Record<string, Participant>, [t])
  const champId = champion(t)
  const prevChamp = useRef(champId)

  useEffect(() => {
    if (!prevChamp.current && champId) setBoom(true)
    prevChamp.current = champId
  }, [champId])

  const tabs: { id: View; label: string }[] = [
    { id: 'equipos', label: 'Equipos' },
    ...(t.format !== 'copa' ? [{ id: 'tablas' as View, label: 'Tabla' }, { id: 'partidos' as View, label: 'Partidos' }] : []),
    ...(t.format !== 'liga' ? [{ id: 'cuadro' as View, label: 'Eliminatorias' }] : []),
  ]
  const current = tabs.some((x) => x.id === view) ? view : 'equipos'

  const setScore = (id: string, patch: Patch) =>
    onChange({
      ...t,
      matches: t.matches.map((m) => {
        if (m.id !== id) return m
        const n = { ...m, ...patch }
        if (n.hg !== n.ag) { n.hp = null; n.ap = null }
        return n
      }),
    })

  const { done, total } = progress(t)
  const fase = t.matches.some((m) => m.stage === 'fase')
  const qualify = fase ? t.matches.filter((m) => m.stage === 'ko' && m.home.t === 'r').length * 2 : 0

  const table = (pids: string[], pred: (m: Match) => boolean, q = 0, title?: string) => (
    <Standings key={title ?? 'all'} title={title} rows={tableFor(t, pids, pred)} pm={pm} qualify={q} />
  )

  return (
    <div>
      {boom && <Confetti />}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div>
          <h1 className="font-display text-5xl font-black uppercase leading-[.95] sm:text-6xl">
            {{ liga: 'Liga', copa: 'Copa', mundial: 'Mundial', champions: 'Champions' }[t.format]}
          </h1>
          <p className="mt-2 text-white/65">{t.participants.length} jugadores · {done} de {total} partidos jugados</p>
        </div>
        <Button variant="ghost" onClick={() => { if (confirm('¿Empezar un torneo nuevo? El actual se va a reemplazar cuando sortees el siguiente.')) onNew() }}>
          Nuevo torneo
        </Button>
      </div>

      {champId && (
        <div className="card relative mb-6 flex flex-wrap items-center gap-5 overflow-hidden border-cielo/50 p-5 animate-pop">
          <div className="absolute inset-0 bg-gradient-to-r from-mar/40 via-transparent to-transparent" />
          <svg className="relative animate-trophy" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8cc2ff" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
            <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" fill="rgba(140,194,255,.2)" />
            <path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v4M8.5 20h7" />
          </svg>
          <TeamBadge team={pm[champId].team} size={56} />
          <div className="relative">
            <p className="text-sm text-white/65">Campeón</p>
            <p className="font-display text-4xl font-black leading-none">{pm[champId].name}</p>
            <p className="mt-1 text-white/70">con {pm[champId].team.name}</p>
          </div>
        </div>
      )}

      <Segmented className="mb-6 max-w-md" value={current} onChange={setView} options={tabs} />

      <div key={current} className="animate-rise">
        {current === 'equipos' && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {t.participants.map((p, i) => (
              <TeamReveal key={p.id} team={p.team} player={p.name} pool={pool} run={reveal} lockAfter={800 + i * 280} compact />
            ))}
          </div>
        )}

        {current === 'tablas' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {t.format === 'liga' && table(t.participants.map((p) => p.id), (m) => m.stage === 'liga')}
            {t.format === 'champions' && table(t.participants.map((p) => p.id), (m) => m.stage === 'fase', qualify)}
            {t.format === 'mundial' &&
              t.groups?.map((g) => table(g.pids, (m) => m.stage === 'grupo' && m.group === g.name, 2, `Grupo ${g.name}`))}
          </div>
        )}

        {current === 'partidos' && (
          <div className="space-y-8">
            {t.format === 'mundial'
              ? t.groups?.map((g) => (
                  <section key={g.name}>
                    <h2 className="mb-3 font-display text-3xl font-extrabold">Grupo {g.name}</h2>
                    <Fixtures t={t} pm={pm} pred={(m) => m.stage === 'grupo' && m.group === g.name} onScore={setScore} />
                  </section>
                ))
              : <Fixtures t={t} pm={pm} pred={(m) => m.stage === 'liga' || m.stage === 'fase'} onScore={setScore} />}
          </div>
        )}

        {current === 'cuadro' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex min-w-max gap-6">
              {rounds(t.matches.filter((m) => m.stage === 'ko')).map(([label, ms]) => (
                <section key={label} className="flex w-[340px] flex-col justify-around gap-3">
                  <h2 className="font-display text-2xl font-extrabold">{label}</h2>
                  {ms.map((m) => <MatchRow key={m.id} m={m} t={t} pm={pm} onScore={setScore} />)}
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function rounds(ms: Match[]): [string, Match[]][] {
  const out: [string, Match[]][] = []
  for (const m of ms) {
    const g = out.find(([l]) => l === m.label)
    if (g) g[1].push(m)
    else out.push([m.label, [m]])
  }
  return out
}

function Fixtures({ t, pm, pred, onScore }: { t: Tournament; pm: Record<string, Participant>; pred: (m: Match) => boolean; onScore: (id: string, p: Patch) => void }) {
  return (
    <div className="space-y-6">
      {rounds(t.matches.filter(pred)).map(([label, ms]) => (
        <section key={label}>
          <h3 className="mb-2 text-sm font-semibold text-white/65">{label}</h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {ms.map((m) => <MatchRow key={m.id} m={m} t={t} pm={pm} onScore={onScore} />)}
          </div>
        </section>
      ))}
    </div>
  )
}

function Standings({ title, rows, pm, qualify }: { title?: string; rows: ReturnType<typeof tableFor>; pm: Record<string, Participant>; qualify: number }) {
  return (
    <section className="card overflow-hidden">
      {title && <h2 className="border-b border-white/10 px-4 py-3 font-display text-2xl font-extrabold">{title}</h2>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-left text-white/50">
            <tr>
              <th className="py-2 pl-4 pr-2 font-medium">#</th>
              <th className="py-2 pr-2 font-medium">Equipo</th>
              {['PJ', 'G', 'E', 'P', 'DG'].map((h) => <th key={h} className="px-2 py-2 text-center font-medium">{h}</th>)}
              <th className="py-2 pl-2 pr-4 text-center font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const p = pm[r.pid]
              return (
                <tr key={r.pid} className={`border-t border-white/5 transition-colors hover:bg-white/5 ${i < qualify ? 'shadow-[inset_3px_0_0_#3f7ae0]' : ''}`}>
                  <td className="py-2.5 pl-4 pr-2 tabular-nums text-white/60">{i + 1}</td>
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-3">
                      <TeamBadge team={p.team} size={28} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold leading-tight">{p.name}</p>
                        <p className="truncate text-xs text-white/50">{p.team.name}</p>
                      </div>
                    </div>
                  </td>
                  {[r.pj, r.g, r.e, r.p, r.dg > 0 ? `+${r.dg}` : r.dg].map((v, k) => (
                    <td key={k} className="px-2 py-2.5 text-center tabular-nums text-white/80">{v}</td>
                  ))}
                  <td className="py-2.5 pl-2 pr-4 text-center font-display text-xl font-extrabold tabular-nums">{r.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {qualify > 0 && <p className="border-t border-white/10 px-4 py-2 text-xs text-white/50">La franja azul marca los clasificados a las eliminatorias.</p>}
    </section>
  )
}

function Side({ p, slot, right }: { p: Participant | null; slot: Slot; right?: boolean }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${right ? 'flex-row-reverse text-right' : ''}`}>
      {p ? <TeamBadge team={p.team} size={34} /> : <div className="h-9 w-9 shrink-0 rounded-full border border-dashed border-white/25" />}
      <div className="min-w-0">
        <p className="truncate font-semibold leading-tight">{p ? p.team.name : 'Por definir'}</p>
        <p className="truncate text-xs text-white/55">{p ? p.name : slotLabel(slot)}</p>
      </div>
    </div>
  )
}

function Num({ value, onChange, disabled, label, small }: { value: number | null | undefined; onChange: (v: number | null) => void; disabled?: boolean; label: string; small?: boolean }) {
  return (
    <input
      type="number" inputMode="numeric" min={0} max={99} aria-label={label} disabled={disabled} value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : Math.max(0, Math.min(99, parseInt(e.target.value, 10) || 0)))}
      className={`rounded-lg border border-white/10 bg-tinta/70 text-center font-display font-bold tabular-nums outline-none transition focus:border-cielo focus:ring-2 focus:ring-cielo/30 disabled:opacity-30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${small ? 'h-8 w-10 text-base' : 'h-11 w-12 text-xl'}`}
    />
  )
}

function MatchRow({ m, t, pm, onScore }: { m: Match; t: Tournament; pm: Record<string, Participant>; onScore: (id: string, p: Patch) => void }) {
  const hid = resolve(m.home, t)
  const aid = resolve(m.away, t)
  const home = hid ? pm[hid] : null
  const away = aid ? pm[aid] : null
  const ready = !!home && !!away
  const tie = m.stage === 'ko' && m.hg != null && m.hg === m.ag
  const diff = home && away ? Math.abs(home.team.ovr - away.team.ovr) : null

  return (
    <div className="card p-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Side p={home} slot={m.home} />
        <div className="flex items-center gap-1.5">
          <Num label="Goles local" value={m.hg} disabled={!ready} onChange={(v) => onScore(m.id, { hg: v })} />
          <span className="text-white/35">-</span>
          <Num label="Goles visitante" value={m.ag} disabled={!ready} onChange={(v) => onScore(m.id, { ag: v })} />
        </div>
        <Side p={away} slot={m.away} right />
      </div>
      {(tie || diff !== null) && (
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-white/45">
          <span>{diff !== null ? `Dif. de valoración ${diff}` : ''}</span>
          {tie && (
            <span className="flex items-center gap-2 text-cielo-300">
              Penales
              <Num small label="Penales local" value={m.hp} onChange={(v) => onScore(m.id, { hp: v })} />
              <Num small label="Penales visitante" value={m.ap} onChange={(v) => onScore(m.id, { ap: v })} />
            </span>
          )}
        </div>
      )}
    </div>
  )
}
