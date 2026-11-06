import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Balance, LeagueId } from './types'
import { BALANCE_HINT } from './draw'
import { LEAGUES } from './teams'

type Variant = 'primary' | 'ghost' | 'dark'

export function Button({
  variant = 'primary',
  small = false,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; small?: boolean; children: ReactNode }) {
  return (
    <button className={`btn btn-${variant} ${small ? 'btn-sm' : ''} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function Segmented<T extends string>({
  options, value, onChange, className = '',
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  const idx = Math.max(0, options.findIndex((o) => o.id === value))
  const n = options.length
  return (
    <div
      role="tablist"
      className={`relative grid rounded-xl border border-white/10 bg-tinta/70 p-1 ${className}`}
      style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
    >
      <span
        aria-hidden
        className="absolute bottom-1 top-1 rounded-lg bg-gradient-to-br from-mar to-mar-400 shadow-lg transition-all duration-300 ease-out"
        style={{ width: `calc((100% - 0.5rem) / ${n})`, left: `calc(0.25rem + (100% - 0.5rem) / ${n} * ${idx})` }}
      />
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={o.id === value}
          onClick={() => onChange(o.id)}
          className={`relative z-10 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cielo ${
            o.id === value ? 'text-white' : 'text-white/60 hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function LeagueChips({ value, onChange }: { value: LeagueId[]; onChange: (v: LeagueId[]) => void }) {
  const toggle = (id: LeagueId) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id])
  return (
    <div className="flex flex-wrap gap-2">
      <button className="chip" data-on={value.length === 0} onClick={() => onChange([])}>
        Todas las ligas
      </button>
      {LEAGUES.map((l) => (
        <button key={l.id} className="chip" data-on={value.includes(l.id)} onClick={() => toggle(l.id)}>
          {l.name}
        </button>
      ))}
    </div>
  )
}

export function BalancePicker({ value, onChange }: { value: Balance; onChange: (v: Balance) => void }) {
  return (
    <div>
      <Segmented
        value={value}
        onChange={onChange}
        options={[
          { id: 'estricto', label: 'Idéntico' },
          { id: 'parejo', label: 'Parejo' },
          { id: 'libre', label: 'Libre' },
        ]}
      />
      <p className="mt-2 text-sm text-white/55">{BALANCE_HINT[value]}</p>
    </div>
  )
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} estrellas`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = value >= i + 1 ? 100 : value >= i + 0.5 ? 50 : 0
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star color="rgba(255,255,255,.18)" size={size} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
              <Star color="#8cc2ff" size={size} />
            </span>
          </span>
        )
      })}
    </span>
  )
}

function Star({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className="block max-w-none">
      <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9Z" />
    </svg>
  )
}

export function PageTitle({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-8 max-w-2xl animate-rise">
      <h1 className="font-display text-5xl font-black uppercase leading-[.95] sm:text-6xl">{title}</h1>
      <p className="mt-3 text-lg text-white/70">{children}</p>
    </div>
  )
}
