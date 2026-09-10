import * as stylex from '@stylexjs/stylex'
import { AnimatePresence, motion, useTransform, type MotionValue, type Transition } from 'motion/react'
import { useEffect, useState } from 'react'
import { items, type Item } from './data'
import { dark, font } from './tokens.stylex'

const spring: Transition = { type: 'spring', stiffness: 80, damping: 17, mass: 1 }

function useViewport() {
  const [v, set] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const on = () => set({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return v
}

/* The mark's four cells, in its own order: half disc, ring, triangle, tilted
   square. Expanded, the hero photographs fill these cells and are clipped to
   the shapes, so the stack becomes the mark itself, sitting exactly on the
   backdrop mark and turning with it. */
const CELLS = [
  { cx: 7.65, cy: 7.5, w: 4.1, h: 8.2 }, // half disc, flat edge at x 5.6
  { cx: 16.5, cy: 7.5, w: 9, h: 9 }, // ring, r 3.6 plus its 1.8 stroke
  { cx: 7.5, cy: 16.5, w: 8, h: 7.2 }, // triangle
  { cx: 16.5, cy: 16.5, w: 9.83, h: 9.83 }, // tilted square, 5.2 plus its 1.75 stroke, on the diagonal
]
// backdrop mark: 110vmin, scaled 1.15 once expanded, so one grid unit is
const unit = (vw: number, vh: number) => (Math.min(vw, vh) * 1.1 * 1.15) / 24

type CardProps = {
  i: number
  item: Item
  expanded: boolean
  scrollY: MotionValue<number>
  cell: number
  vw: number
  vh: number
  onExplore?: () => void
}

function Card({ i, item, expanded, scrollY, cell, vw, vh, onExplore }: CardProps) {
  // deeper cards lag the scroll, nearer ones lead it
  const py = useTransform(scrollY, (v) => v * (1 - item.depth) * 0.5)
  const pr = useTransform(scrollY, (v) => v * (item.depth - 1) * 0.012)
  const c = item.cluster
  const h = item.hero
  const u = unit(vw, vh)
  const delay = expanded ? i * 0.04 : (items.length - i) * 0.015
  const target =
    expanded && h !== undefined
      ? { x: (CELLS[h].cx - 12) * u, y: (CELLS[h].cy - 12) * u, width: CELLS[h].w * u, height: CELLS[h].h * u, scale: 1, opacity: 1 }
      : { x: c.x, y: c.y, width: item.w, height: item.w / item.ratio, scale: c.s, opacity: c.hidden ? 0 : 1 }
  const z = expanded ? (h !== undefined ? 10 + i : 1) : c.z

  return (
    <motion.div {...stylex.props(styles.slot)} style={{ y: cell >= 0 && expanded ? 0 : py, rotate: cell >= 0 && expanded ? 0 : pr, zIndex: z }}>
      <motion.div
        {...stylex.props(styles.card, onExplore && !expanded && styles.clickable)}
        initial={{ x: c.x, y: c.y + 40, width: item.w, height: item.w / item.ratio, scale: c.s * 0.94, opacity: 0 }}
        animate={target}
        transition={{
          default: { ...spring, delay },
          opacity: { duration: 0.45, delay: expanded ? delay : delay + 0.3 },
        }}
        style={{ clipPath: expanded && h !== undefined ? `url(#dm-cell-${h})` : 'none'}}
        onClick={!expanded ? onExplore : undefined}
      >
        {onExplore && !expanded ? <Slats src={item.src} /> : <img {...stylex.props(styles.img)} src={item.src} alt="" draggable={false} />}
        {onExplore && <Pill label={expanded ? 'Scroll' : 'Explore'} />}
      </motion.div>
    </motion.div>
  )
}

/* Clip shapes in object bounding box units, each the mark's own shape inside its cell's box. */
function Clips() {
  return (
    <svg width="0" height="0" aria-hidden="true" {...stylex.props(styles.clips)}>
      <defs>
        <clipPath id="dm-cell-0" clipPathUnits="objectBoundingBox">
          <path d="M0 0A1 0.5 0 0 1 0 1Z" />
        </clipPath>
        <clipPath id="dm-cell-1" clipPathUnits="objectBoundingBox">
          <path d="M0.5 0A0.5 0.5 0 1 1 0.5 1A0.5 0.5 0 1 1 0.5 0ZM0.5 0.2A0.3 0.3 0 1 0 0.5 0.8A0.3 0.3 0 1 0 0.5 0.2Z" clipRule="evenodd" />
        </clipPath>
        <clipPath id="dm-cell-2" clipPathUnits="objectBoundingBox">
          <path d="M0.5 0L0 1H1Z" />
        </clipPath>
        <clipPath id="dm-cell-3" clipPathUnits="objectBoundingBox">
          <path d="M0.5 0L1 0.5L0.5 1L0 0.5ZM0.5 0.252L0.748 0.5L0.5 0.748L0.252 0.5Z" clipRule="evenodd" />
        </clipPath>
      </defs>
    </svg>
  )
}

const SLATS = 12

/* The featured photograph assembles from horizontal slats sliding in from
   alternate sides. Once landed the strips tile the image exactly. */
function Slats({ src }: { src: string }) {
  return (
    <div {...stylex.props(styles.img)}>
      {Array.from({ length: SLATS }, (_, i) => (
        <motion.div
          key={i}
          {...stylex.props(styles.slat)}
          style={{
            top: `${(i / SLATS) * 100}%`,
            height: `${100 / SLATS + 0.2}%`,
            backgroundImage: `url(${src})`,
            backgroundSize: `100% ${SLATS * 100}%`,
            backgroundPosition: `0 ${(i / (SLATS - 1)) * 100}%`,
          }}
          initial={{ x: i % 2 ? '70%' : '-70%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.25 + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  )
}

function Pill({ label }: { label: string }) {
  return (
    <motion.div layout {...stylex.props(styles.pill)} transition={{ layout: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}>
      <span {...stylex.props(styles.dot)} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}

export function Gallery({
  expanded,
  scrollY,
  onExplore,
}: {
  expanded: boolean
  scrollY: MotionValue<number>
  onExplore: () => void
}) {
  const { w: vw, h: vh } = useViewport()
  // the lattice takes the same quarter turn as the backdrop mark behind it
  const theta = useTransform(scrollY, [0, 3000], [0, 90])
  // the photographs dissolve out of the mark as it turns, leaving the lattice to the sections
  const fade = useTransform(scrollY, [150, 800], [1, 0])
  return (
    <motion.div {...stylex.props(styles.root)} style={{ rotate: theta, opacity: fade }}>
      <Clips />
      {items.map((item, i) => (
        <Card
          key={item.id}
          i={i}
          item={item}
          expanded={expanded}
          scrollY={scrollY}
          cell={item.hero ?? -1}
          vw={vw}
          vh={vh}
          onExplore={i === 0 ? onExplore : undefined}
        />
      ))}
    </motion.div>
  )
}

const styles = stylex.create({
  root: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
  },
  clips: {
    position: 'absolute',
  },
  slot: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    willChange: 'transform',
  },
  card: {
    position: 'absolute',
    translate: '-50% -50%',
    overflow: 'hidden',
    backgroundColor: dark.surface,
    boxShadow: '0 30px 60px -24px rgba(0,0,0,0.7)',
  },
  clickable: {
    pointerEvents: 'auto',
    cursor: 'pointer',
  },
  img: {
    position: 'relative',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    overflow: 'hidden',
  },
  slat: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundRepeat: 'no-repeat',
  },
  pill: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    translate: '-50% -50%',
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '9px 13px',
    backgroundColor: dark.paper,
    color: dark.ink,
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    lineHeight: 1,
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: 'currentColor',
  },
})
