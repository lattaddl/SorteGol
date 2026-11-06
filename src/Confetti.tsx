import { useEffect, useMemo, useState } from 'react'

const COLORS = ['#8cc2ff', '#3f7ae0', '#ffffff', '#1d56c4']

export function Confetti() {
  const [on, setOn] = useState(true)
  const bits = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        dur: 2.6 + Math.random() * 2,
        w: 6 + Math.random() * 7,
        color: COLORS[i % COLORS.length],
      })),
    [],
  )
  useEffect(() => {
    const id = window.setTimeout(() => setOn(false), 6500)
    return () => window.clearTimeout(id)
  }, [])
  if (!on) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute top-0 block animate-fall rounded-[2px]"
          style={{ left: `${b.left}%`, width: b.w, height: b.w * 1.6, background: b.color, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}
        />
      ))}
    </div>
  )
}
