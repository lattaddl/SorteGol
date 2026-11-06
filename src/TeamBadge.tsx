import { useState } from 'react'
import type { Team } from './types'

const PALETTE = [
  ['#1d56c4', '#8cc2ff'],
  ['#0e2d6b', '#3f7ae0'],
  ['#1a4aa8', '#b8dcff'],
  ['#0a2150', '#5ea6f5'],
]
const SKIP = ['de', 'del', 'la', 'el', 'fc', 'cf', 'sc']

function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

export function initials(name: string) {
  const words = name.replace(/[.'’]/g, '').split(/\s+/).filter((w) => !SKIP.includes(w.toLowerCase()))
  if (words.length <= 1) return (words[0] ?? name).slice(0, 3).toUpperCase()
  return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase()
}

/**
 * Muestra el escudo desde /public/escudos/<id>.png.
 * Si la imagen no existe, usa un escudo genérico con las iniciales.
 */
export function TeamBadge({ team, size = 48 }: { team: Pick<Team, 'id' | 'name'>; size?: number }) {
  const [failedId, setFailedId] = useState<string | null>(null)
  if (failedId !== team.id) {
    return (
      <img
        src={`/escudos/${team.id}.png`}
        alt={team.name}
        loading="lazy"
        onError={() => setFailedId(team.id)}
        className="shrink-0 object-contain"
        style={{ width: size, height: size * 1.1 }}
      />
    )
  }
  const [c1, c2] = PALETTE[hash(team.id) % PALETTE.length]
  const gid = `b${hash(team.id)}`
  const text = initials(team.name)
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 64 70" role="img" aria-label={team.name} className="shrink-0">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c2} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
      </defs>
      <path d="M32 2 60 11v25c0 18-14 28-28 32C18 64 4 54 4 36V11Z" fill={`url(#${gid})`} stroke="#020611" strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 8 54 15v21c0 13-10 21-22 26" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2" />
      <text
        x="32" y="42" textAnchor="middle" fill="#fff" stroke="#020611" strokeWidth=".9" paintOrder="stroke"
        fontFamily="'Big Shoulders Display', sans-serif" fontWeight="900" fontSize={text.length > 2 ? 19 : 25}
      >
        {text}
      </text>
    </svg>
  )
}
