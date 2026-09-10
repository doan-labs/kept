import * as stylex from '@stylexjs/stylex'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'
import { items } from './data'
import { DoanMark } from './DoanMark'
import { dark, font } from './tokens.stylex'

const hero = items.filter((i) => i.hero !== undefined)
const ease = [0.22, 1, 0.36, 1] as const

/* Real progress: the counter follows the hero photographs as they decode.
   The mark's lattice takes its quarter turn over the same count, so 100 is
   the hover pose. */
export function Loader({ onDone }: { onDone: () => void }) {
  const [loaded, setLoaded] = useState(0)
  const [done, setDone] = useState(false)
  const count = useMotionValue(0)
  const text = useTransform(count, (v) => String(Math.round(v)).padStart(3, '0'))
  const scaleX = useTransform(count, (v) => v / 100)
  const rotate = useTransform(count, (v) => v * 0.9)
  const counter = useTransform(count, (v) => -v * 0.9)

  useEffect(() => {
    let alive = true
    for (const it of hero) {
      const img = new Image()
      img.onload = img.onerror = () => alive && setLoaded((n) => n + 1)
      img.src = it.src
    }
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const target = (loaded / hero.length) * 100
    const c = animate(count, target, { duration: 0.9, ease, onComplete: () => target >= 100 && setDone(true) })
    return () => c.stop()
  }, [loaded, count])

  useEffect(() => {
    if (!done) return
    const t = setTimeout(onDone, 1100)
    return () => clearTimeout(t)
  }, [done, onDone])

  return (
    <motion.div
      {...stylex.props(styles.root)}
      exit={{ y: '-115%', rotate: -5, transition: { duration: 1.1, ease } }}
      style={{ transformOrigin: 'top left' }}
      aria-live="polite"
      aria-busy={!done}
    >
      <motion.div {...stylex.props(styles.mark)} style={{ rotate }}>
        <motion.div style={{ rotate: counter }}>
          <DoanMark size="min(28vmin, 220px)" />
        </motion.div>
      </motion.div>

      <motion.div
        {...stylex.props(styles.word)}
        initial={{ opacity: 0, y: 12 }}
        animate={done ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.7, ease }}
      >
        <span {...stylex.props(styles.wordmark)}>DOAN</span>
        <span {...stylex.props(styles.kicker)}>Photographs · Linh · 2026</span>
      </motion.div>

      <motion.span {...stylex.props(styles.count)}>{text}</motion.span>
      <motion.div {...stylex.props(styles.bar)} style={{ scaleX }} />
    </motion.div>
  )
}

const styles = stylex.create({
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 500,
    display: 'grid',
    placeItems: 'center',
    backgroundColor: dark.paper,
    color: dark.ink,
  },
  mark: {
    display: 'grid',
    placeItems: 'center',
  },
  word: {
    position: 'absolute',
    left: '50%',
    top: 'calc(50% + min(18vmin, 150px))',
    translate: '-50% 0',
    display: 'grid',
    justifyItems: 'center',
    gap: 10,
  },
  wordmark: {
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  kicker: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: dark.inkMuted,
  },
  count: {
    position: 'absolute',
    left: '2.6vw',
    bottom: '4vh',
    fontFamily: font.mono,
    fontSize: 12,
    letterSpacing: '0.04em',
    color: dark.inkMuted,
    fontVariantNumeric: 'tabular-nums',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: dark.ink,
    transformOrigin: 'left',
  },
})
