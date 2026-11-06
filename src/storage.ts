import { useEffect, useState } from 'react'

const PREFIX = 'sorteafc.'

export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      /* almacenamiento lleno o bloqueado: seguimos sin persistir */
    }
  }, [key, value])

  return [value, setValue] as const
}
