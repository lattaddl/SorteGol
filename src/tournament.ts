import type { Format, Match, Participant, Slot, Team, Tournament } from './types'
import { shuffle } from './draw'

export interface FormatInfo {
  id: Format
  name: string
  desc: string
  min: number
  max: number
  even?: boolean
}

export const FORMATS: FormatInfo[] = [
  { id: 'liga', name: 'Liga', desc: 'Todos contra todos. Gana el que más puntos junta.', min: 3, max: 12 },
  { id: 'copa', name: 'Copa', desc: 'Eliminación directa. Perdés y quedás afuera.', min: 2, max: 32 },
  { id: 'mundial', name: 'Mundial', desc: 'Fase de grupos y cruces eliminatorios.', min: 6, max: 32 },
  {
    id: 'champions',
    name: 'Champions',
    desc: 'Fase liga con rivales de nivel parecido y llaves para los mejores.',
    min: 8,
    max: 32,
    even: true,
  },
]

const uid = () => Math.random().toString(36).slice(2, 9)
const P = (pid: string): Slot => ({ t: 'p', pid })

/* ───────── Fixtures ───────── */

function roundRobin(
  ids: string[],
  double: boolean,
  stage: Match['stage'],
  group?: string,
  prefix = '',
): Match[] {
  const arr: (string | null)[] = shuffle(ids)
  if (arr.length % 2) arr.push(null)
  const n = arr.length
  const rounds = n - 1
  const out: Match[] = []
  let ring = [...arr]
  const legs = double ? 2 : 1

  for (let leg = 0; leg < legs; leg++) {
    ring = [...arr]
    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < n / 2; i++) {
        const a = ring[i]
        const b = ring[n - 1 - i]
        if (!a || !b) continue
        const flip = ((r + i) % 2 === 1) !== (leg === 1)
        const [h, w] = flip ? [b, a] : [a, b]
        out.push({
          id: `${prefix}${leg}-${r}-${i}`,
          stage,
          group,
          label: `Fecha ${leg * rounds + r + 1}`,
          home: P(h),
          away: P(w),
        })
      }
      ring = [ring[0], ring[n - 1], ...ring.slice(1, n - 1)]
    }
  }
  return out
}

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

function pairUp(
  order: Participant[],
  played: Set<string>,
  budget: { n: number },
): [Participant, Participant][] | null {
  if (!order.length) return []
  if (budget.n-- <= 0) return null
  const [first, ...rest] = order
  for (let i = 0; i < rest.length; i++) {
    const other = rest[i]
    if (played.has(pairKey(first.id, other.id))) continue
    const sub = pairUp([...rest.slice(0, i), ...rest.slice(i + 1)], played, budget)
    if (sub) return [[first, other], ...sub]
  }
  return null
}

/** Fase liga estilo Champions: cada ronda empareja equipos de valoración parecida, sin repetir rivales. */
function leaguePhase(ps: Participant[], rounds: number): Match[] {
  const played = new Set<string>()
  const out: Match[] = []
  for (let r = 0; r < rounds; r++) {
    let pairs: [Participant, Participant][] | null = null
    for (let attempt = 0; attempt < 80 && !pairs; attempt++) {
      const noise = attempt < 40 ? 6 : 20
      const order = ps
        .map((p) => ({ p, s: p.team.ovr + (Math.random() - 0.5) * noise }))
        .sort((x, y) => y.s - x.s)
        .map((x) => x.p)
      pairs = pairUp(order, played, { n: 4000 })
    }
    if (!pairs) {
      const order = shuffle(ps)
      pairs = []
      for (let i = 0; i + 1 < order.length; i += 2) pairs.push([order[i], order[i + 1]])
    }
    pairs.forEach(([a, b], i) => {
      played.add(pairKey(a.id, b.id))
      const flip = Math.random() < 0.5
      out.push({
        id: `fase-${r}-${i}`,
        stage: 'fase',
        label: `Jornada ${r + 1}`,
        home: P(flip ? b.id : a.id),
        away: P(flip ? a.id : b.id),
      })
    })
  }
  return out
}

/* ───────── Eliminatorias ───────── */

const pow2ceil = (n: number) => {
  let p = 1
  while (p < n) p *= 2
  return p
}

function bracketOrder(size: number): number[] {
  let o = [1]
  while (o.length < size) {
    const n = o.length * 2
    o = o.flatMap((s) => [s, n + 1 - s])
  }
  return o
}

function pairsFromSeeds(seeds: Slot[]): [Slot | null, Slot | null][] {
  const order = bracketOrder(pow2ceil(Math.max(2, seeds.length)))
  const at = (k: number) => (k <= seeds.length ? seeds[k - 1] : null)
  const pairs: [Slot | null, Slot | null][] = []
  for (let i = 0; i < order.length; i += 2) pairs.push([at(order[i]), at(order[i + 1])])
  return pairs
}

function roundName(teams: number) {
  if (teams === 2) return 'Final'
  if (teams === 4) return 'Semifinales'
  if (teams === 8) return 'Cuartos de final'
  if (teams === 16) return 'Octavos de final'
  return `Ronda de ${teams}`
}

function buildKnockout(first: [Slot | null, Slot | null][]): Match[] {
  const out: Match[] = []
  let pairs = first
  let round = 0
  for (;;) {
    const label = roundName(pairs.length * 2)
    const next: Slot[] = []
    pairs.forEach(([a, b], i) => {
      if (a && b) {
        const m: Match = { id: `ko-${round}-${i}`, stage: 'ko', label, home: a, away: b }
        out.push(m)
        next.push({ t: 'w', m: m.id })
      } else {
        next.push((a ?? b) as Slot)
      }
    })
    if (next.length <= 1) break
    pairs = []
    for (let i = 0; i < next.length; i += 2) pairs.push([next[i], next[i + 1]])
    round++
  }
  return out
}

/* ───────── Creación ───────── */

export function createTournament(format: Format, names: string[], teams: Team[], double: boolean): Tournament {
  const participants: Participant[] = shuffle(teams).map((team, i) => ({
    id: uid(),
    name: names[i]?.trim() || `Jugador ${i + 1}`,
    team,
  }))
  const ids = participants.map((p) => p.id)
  const base = { id: uid(), format, createdAt: Date.now(), double, participants }

  if (format === 'liga') {
    return { ...base, matches: roundRobin(ids, double, 'liga') }
  }

  if (format === 'copa') {
    const sorted = participants
      .map((p) => ({ p, s: p.team.ovr + (Math.random() - 0.5) * 3 }))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.p)
    const size = pow2ceil(sorted.length)
    const byes = size - sorted.length
    const pairs: [Slot | null, Slot | null][] = []
    sorted.slice(0, byes).forEach((p) => pairs.push([P(p.id), null]))
    const rest = sorted.slice(byes)
    for (let i = 0; i < rest.length; i += 2) pairs.push([P(rest[i].id), P(rest[i + 1].id)])
    return { ...base, matches: buildKnockout(shuffle(pairs)) }
  }

  if (format === 'mundial') {
    const sorted = [...participants].sort((a, b) => b.team.ovr - a.team.ovr)
    const g = Math.min(8, Math.max(2, Math.round(participants.length / 4)))
    const groups = Array.from({ length: g }, (_, i) => ({ name: String.fromCharCode(65 + i), pids: [] as string[] }))
    for (let k = 0; k < sorted.length; k += g) {
      shuffle(sorted.slice(k, k + g)).forEach((p, i) => groups[i].pids.push(p.id))
    }
    const matches = groups.flatMap((gr) => roundRobin(gr.pids, false, 'grupo', gr.name, `g${gr.name}-`))
    const winners: Slot[] = groups.map((gr) => ({ t: 'g', g: gr.name, pos: 1 }))
    const runners: Slot[] = groups.map((_, i) => ({ t: 'g', g: groups[(i + 1) % g].name, pos: 2 }))
    const seeds = [...winners, ...runners.reverse()]
    return { ...base, groups, matches: [...matches, ...buildKnockout(pairsFromSeeds(seeds))] }
  }

  const n = participants.length
  const rounds = Math.min(n >= 12 ? 5 : 4, n - 1)
  const q = Math.max(4, 2 ** Math.floor(Math.log2(n / 2)))
  const seeds: Slot[] = Array.from({ length: q }, (_, i) => ({ t: 'r', rank: i + 1 }))
  return { ...base, matches: [...leaguePhase(participants, rounds), ...buildKnockout(pairsFromSeeds(seeds))] }
}

/* ───────── Resultados y tablas ───────── */

export type Outcome = 'home' | 'away' | 'draw' | null

export function outcome(m: Match): Outcome {
  if (m.hg == null || m.ag == null) return null
  if (m.hg > m.ag) return 'home'
  if (m.hg < m.ag) return 'away'
  if (m.stage === 'ko') {
    if (m.hp != null && m.ap != null && m.hp !== m.ap) return m.hp > m.ap ? 'home' : 'away'
    return null
  }
  return 'draw'
}

export interface Row {
  pid: string
  pj: number
  g: number
  e: number
  p: number
  gf: number
  gc: number
  dg: number
  pts: number
}

export function tableFor(t: Tournament, pids: string[], pred: (m: Match) => boolean): Row[] {
  const rows = new Map<string, Row>(
    pids.map((id) => [id, { pid: id, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 }]),
  )
  for (const m of t.matches.filter(pred)) {
    if (m.hg == null || m.ag == null || m.home.t !== 'p' || m.away.t !== 'p') continue
    const h = rows.get(m.home.pid)
    const a = rows.get(m.away.pid)
    if (!h || !a) continue
    h.pj++; a.pj++
    h.gf += m.hg; h.gc += m.ag
    a.gf += m.ag; a.gc += m.hg
    if (m.hg > m.ag) { h.g++; a.p++; h.pts += 3 }
    else if (m.hg < m.ag) { a.g++; h.p++; a.pts += 3 }
    else { h.e++; a.e++; h.pts++; a.pts++ }
  }
  const name = (id: string) => t.participants.find((p) => p.id === id)?.name ?? ''
  return [...rows.values()]
    .map((r) => ({ ...r, dg: r.gf - r.gc }))
    .sort((x, y) => y.pts - x.pts || y.dg - x.dg || y.gf - x.gf || name(x.pid).localeCompare(name(y.pid)))
}

function stageDone(t: Tournament, pred: (m: Match) => boolean) {
  const ms = t.matches.filter(pred)
  return ms.length > 0 && ms.every((m) => m.hg != null && m.ag != null)
}

export function resolve(slot: Slot, t: Tournament): string | null {
  switch (slot.t) {
    case 'p':
      return slot.pid
    case 'w': {
      const m = t.matches.find((x) => x.id === slot.m)
      if (!m) return null
      const o = outcome(m)
      if (o === 'home') return resolve(m.home, t)
      if (o === 'away') return resolve(m.away, t)
      return null
    }
    case 'r': {
      const pred = (m: Match) => m.stage === 'fase'
      if (!stageDone(t, pred)) return null
      return tableFor(t, t.participants.map((p) => p.id), pred)[slot.rank - 1]?.pid ?? null
    }
    case 'g': {
      const gr = t.groups?.find((x) => x.name === slot.g)
      if (!gr) return null
      const pred = (m: Match) => m.stage === 'grupo' && m.group === gr.name
      if (!stageDone(t, pred)) return null
      return tableFor(t, gr.pids, pred)[slot.pos - 1]?.pid ?? null
    }
  }
}

export function slotLabel(slot: Slot): string {
  if (slot.t === 'r') return `${slot.rank}.º de la fase liga`
  if (slot.t === 'g') return `${slot.pos}.º del Grupo ${slot.g}`
  if (slot.t === 'w') return 'Ganador de la llave anterior'
  return ''
}

export function champion(t: Tournament): string | null {
  if (t.format === 'liga') {
    const pred = (m: Match) => m.stage === 'liga'
    if (!stageDone(t, pred)) return null
    return tableFor(t, t.participants.map((p) => p.id), pred)[0]?.pid ?? null
  }
  const ko = t.matches.filter((m) => m.stage === 'ko')
  const final = ko[ko.length - 1]
  return final ? resolve({ t: 'w', m: final.id }, t) : null
}

export function progress(t: Tournament) {
  const total = t.matches.length
  const done = t.matches.filter((m) => outcome(m) !== null).length
  return { total, done }
}
