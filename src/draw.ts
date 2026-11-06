import type { Balance, Team } from './types'

/** Diferencia máxima de valoración permitida dentro de un sorteo. */
export const TOLERANCE: Record<Balance, number> = { estricto: 2, parejo: 4, libre: 60 }

export const BALANCE_HINT: Record<Balance, string> = {
  estricto: 'Hasta 2 puntos de diferencia entre equipos.',
  parejo: 'Hasta 4 puntos de diferencia entre equipos.',
  libre: 'Cualquier equipo contra cualquiera.',
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const sample = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export interface Band {
  teams: Team[]
  /** Diferencia real entre el mejor y el peor equipo sorteado. */
  spread: number
  /** true si hubo que ampliar la tolerancia porque no alcanzaban equipos. */
  widened: boolean
}

/**
 * Elige `n` equipos cuya valoración quede dentro de una banda angosta.
 * Si los filtros no dejan suficientes equipos, amplía la banda de a poco.
 */
export function pickBand(pool: Team[], n: number, tolerance: number): Band | null {
  if (pool.length < n) return null
  for (let spread = tolerance; spread <= 60; spread++) {
    const half = spread / 2
    const near = (c: Team) => pool.filter((u) => Math.abs(u.ovr - c.ovr) <= half)
    const anchors = pool.filter((t) => near(t).length >= n)
    if (anchors.length) {
      const center = sample(anchors)
      const teams = shuffle(near(center)).slice(0, n)
      const ovrs = teams.map((t) => t.ovr)
      return { teams, spread: Math.max(...ovrs) - Math.min(...ovrs), widened: spread > tolerance }
    }
  }
  return null
}
