import * as stylex from '@stylexjs/stylex'
import { motion, useReducedMotion, useTransform, type MotionValue, type Variants } from 'motion/react'
import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { items, type Item } from './data'
import { DoanMark } from './DoanMark'
import { dark, font } from './tokens.stylex'

const by = (id: string) => items.find((i) => i.id === id)!
const statement = by('courtyard')
const row = [by('lakeside'), by('studio'), by('campus')]
const collage = [by('forest'), by('terrace'), by('plaza')]
const feature = by('horizon')
const closing = by('pavilion')
const num = (item: Item) => `N° ${String(items.indexOf(item) + 1).padStart(2, '0')}`

const ease = [0.22, 1, 0.36, 1] as const
const rise: Variants = {
  hidden: { opacity: 0, y: 48 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease } },
}
const reveal = { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.2 }, variants: rise } as const

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/* 0..1 as the section crosses the viewport. `pass` runs from entering at the
   bottom to leaving at the top; `pin` runs while a sticky child is held.
   Measured from Lenis' scroll value, so it stays in step with the smoothing. */
function useProgress(ref: RefObject<HTMLElement | null>, scrollY: MotionValue<number>, mode: 'pass' | 'pin') {
  const r = useRef({ a: 0, b: 1 })
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current
      if (!el) return
      const vh = window.innerHeight
      const top = el.getBoundingClientRect().top + scrollY.get()
      const h = el.offsetHeight
      r.current = mode === 'pin' ? { a: top, b: top + h - vh } : { a: top - vh, b: top + h }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [ref, scrollY, mode])
  return useTransform(scrollY, (v) => clamp01((v - r.current.a) / (r.current.b - r.current.a)))
}

const useSeg = (p: MotionValue<number>, a: number, b: number) => useTransform(p, (v) => clamp01((v - a) / (b - a)))

/* ---- pieces ---- */

function Ch({ ch, p, a, b }: { ch: string; p: MotionValue<number>; a: number; b: number }) {
  const t = useSeg(p, a, b)
  const opacity = t
  const y = useTransform(t, (v) => (1 - v) * 14)
  const filter = useTransform(t, (v) => `blur(${(1 - v) * 6}px)`)
  return (
    <motion.span {...stylex.props(styles.ch)} style={{ opacity, y, filter }}>
      {ch === ' ' ? ' ' : ch}
    </motion.span>
  )
}

/* Characters land one after another as the scroll passes. */
function Typed({ text, p, from, to }: { text: string; p: MotionValue<number>; from: number; to: number }) {
  const chars = [...text]
  const step = (to - from) / chars.length
  return (
    <span aria-label={text}>
      {chars.map((c, i) => (
        <Ch key={i} ch={c} p={p} a={from + i * step * 0.7} b={from + i * step * 0.7 + step * 3} />
      ))}
    </span>
  )
}

const COLS = 8
const ROWS = 6

function Cell({ src, i, p }: { src: string; i: number; p: MotionValue<number> }) {
  const c = i % COLS
  const r = Math.floor(i / COLS)
  const d = Math.hypot(c - (COLS - 1) / 2, r - (ROWS - 1) / 2) / Math.hypot(COLS / 2, ROWS / 2)
  const t = useSeg(p, 0.15 + d * 0.35, 0.45 + d * 0.35)
  const scale = useTransform(t, (v) => 0.12 + v * 0.88)
  // every tile starts as the mark's tilted square and rights itself
  const rotate = useTransform(t, (v) => (1 - v) * 45)
  return (
    <motion.div
      {...stylex.props(styles.cell)}
      style={{
        scale,
        rotate,
        backgroundImage: `url(${src})`,
        backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
        backgroundPosition: `${(c / (COLS - 1)) * 100}% ${(r / (ROWS - 1)) * 100}%`,
      }}
    />
  )
}

/* The photograph arrives as a lattice of dots that grow into tiles, from the
   centre out. The 24-cell grid the mark is drawn on, loosely. */
function GridReveal({ src, p }: { src: string; p: MotionValue<number> }) {
  return (
    <div {...stylex.props(styles.grid)}>
      {Array.from({ length: COLS * ROWS }, (_, i) => (
        <Cell key={i} src={src} i={i} p={p} />
      ))}
    </div>
  )
}

/* ---- sections ---- */

function Statement({ scrollY }: { scrollY: MotionValue<number> }) {
  const ref = useRef<HTMLElement>(null)
  const p = useProgress(ref, scrollY, 'pin')
  const w1 = useSeg(p, 0.02, 0.18)
  const w2 = useSeg(p, 0.14, 0.3)
  const rule = useSeg(p, 0.28, 0.5)
  const w3 = useSeg(p, 0.46, 0.62)
  const kick = useSeg(p, 0.55, 0.75)
  const fade = useTransform(p, [0.86, 1], [1, 0])
  return (
    <section ref={ref} {...stylex.props(styles.pin2)}>
      <motion.div {...stylex.props(styles.sticky, styles.pad)} style={{ opacity: fade }}>
        <h2 {...stylex.props(styles.heading, styles.statement)}>
          <motion.span {...stylex.props(styles.word)} style={{ opacity: w1 }}>
            Made to be looked at,
          </motion.span>
          <br />
          <motion.span {...stylex.props(styles.word)} style={{ opacity: w2 }}>
            not
          </motion.span>
          <motion.span {...stylex.props(styles.rule)} style={{ scaleX: rule }} />
          <motion.span {...stylex.props(styles.word)} style={{ opacity: w3 }}>
            scrolled past.
          </motion.span>
        </h2>
        <motion.p {...stylex.props(styles.kicker, styles.statementKick)} style={{ opacity: kick }}>
          {num(statement)} · {statement.id}
        </motion.p>
        <div {...stylex.props(styles.statementImg)}>
          <GridReveal src={statement.src} p={p} />
        </div>
      </motion.div>
    </section>
  )
}

function Row() {
  return (
    <section {...stylex.props(styles.section, styles.pad)}>
      <motion.div {...reveal}>
        <p {...stylex.props(styles.kicker)}>Selected</p>
        <h2 {...stylex.props(styles.heading)}>
          A <em {...stylex.props(styles.em)}>selection</em>
          <br />
          of photographs
        </h2>
      </motion.div>
      <div {...stylex.props(styles.row)}>
        {row.map((item, k) => (
          <motion.figure
            key={item.id}
            {...stylex.props(styles.figure)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 60, rotate: k % 2 ? 3 : -3 },
              show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 1.1, delay: k * 0.12, ease } },
            }}
          >
            {/* slash wipe: a 45° edge sweeps left to right. Driven by the
                figure's variants: a zero-area clip never intersects on its own. */}
            <motion.div
              {...stylex.props(styles.rowClip)}
              variants={{
                hidden: { clipPath: 'polygon(0% 0%, 0% 0%, -100% 100%, -100% 100%)' },
                show: {
                  clipPath: 'polygon(0% 0%, 200% 0%, 100% 100%, -100% 100%)',
                  transition: { duration: 1.3, delay: 0.1 + k * 0.12, ease },
                },
              }}
            >
              <motion.img
                {...stylex.props(styles.rowImg)}
                src={item.src}
                alt=""
                variants={{
                  hidden: { scale: 1.2 },
                  show: { scale: 1, transition: { duration: 1.6, delay: k * 0.12, ease } },
                }}
              />
            </motion.div>
            <figcaption {...stylex.props(styles.caption)}>
              <span>{num(item)}</span>
              <span {...stylex.props(styles.faint)}>{item.id}</span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}

function Collage({ scrollY }: { scrollY: MotionValue<number> }) {
  const ref = useRef<HTMLElement>(null)
  const p = useProgress(ref, scrollY, 'pass')
  const y0 = useTransform(p, [0, 1], [120, -160])
  const y1 = useTransform(p, [0, 1], [40, -60])
  const y2 = useTransform(p, [0, 1], [200, -240])
  const r0 = useTransform(p, [0, 1], [-6, 3])
  const r1 = useTransform(p, [0, 1], [4, -2])
  const r2 = useTransform(p, [0, 1], [-3, 5])
  const rotate = useTransform(p, [0, 1], [0, 90])
  const counter = useTransform(p, [0, 1], [0, -90])
  const ys = [y0, y1, y2]
  const rs = [r0, r1, r2]
  return (
    <section ref={ref} {...stylex.props(styles.section, styles.pad, styles.collage)}>
      {collage.map((item, k) => (
        <motion.img
          key={item.id}
          {...stylex.props(styles.collageImg, collagePos[k as 0 | 1 | 2])}
          style={{ y: ys[k], rotate: rs[k] }}
          src={item.src}
          alt=""
        />
      ))}
      <div {...stylex.props(styles.collageMark)}>
        <motion.div style={{ rotate }}>
          <motion.div style={{ rotate: counter }}>
            <DoanMark size="min(14vw, 140px)" />
          </motion.div>
        </motion.div>
        <h2 {...stylex.props(styles.heading, styles.big)}>
          <Typed text="Photographs" p={p} from={0.3} to={0.5} />
          <br />
          <em {...stylex.props(styles.em)}>
            <Typed text="by" p={p} from={0.5} to={0.55} />
          </em>{' '}
          <Typed text="Linh" p={p} from={0.55} to={0.65} />
        </h2>
      </div>
    </section>
  )
}

function Ghost({ scrollY }: { scrollY: MotionValue<number> }) {
  const ref = useRef<HTMLElement>(null)
  const p = useProgress(ref, scrollY, 'pass')
  // two rows walk against each other, a slash swings across them
  const x1 = useTransform(p, [0, 1], ['0%', '-30%'])
  const x2 = useTransform(p, [0, 1], ['-30%', '0%'])
  const slash = useTransform(p, [0, 1], [-40, 40])
  const text = useSeg(p, 0.4, 0.6)
  return (
    <section ref={ref} {...stylex.props(styles.section, styles.ghost)}>
      <motion.div {...stylex.props(styles.ghostRow)} style={{ x: x1 }} aria-hidden="true">
        {'Photographs · '.repeat(4)}
      </motion.div>
      <motion.div {...stylex.props(styles.ghostRow, styles.ghostOutline)} style={{ x: x2 }} aria-hidden="true">
        {'Linh · 2026 · '.repeat(6)}
      </motion.div>
      <motion.div {...stylex.props(styles.slash)} style={{ rotate: slash }} />
      <motion.p {...stylex.props(styles.kicker, styles.center, styles.ghostKick)} style={{ opacity: text }}>
        N° 01 to {String(items.length).padStart(2, '0')}
      </motion.p>
    </section>
  )
}

/* Held for two and a half screens while the photograph grows to the edges. */
function Feature({ scrollY }: { scrollY: MotionValue<number> }) {
  const ref = useRef<HTMLElement>(null)
  const p = useProgress(ref, scrollY, 'pin')
  const scale = useTransform(p, [0, 0.8], [0.42, 1])
  const rotate = useTransform(p, [0, 0.8], [-7, 0])
  const title = useTransform(p, [0.25, 0.45], [1, 0])
  const titleY = useTransform(p, [0.25, 0.45], [0, -30])
  return (
    <section ref={ref} {...stylex.props(styles.pin25)}>
      <div {...stylex.props(styles.sticky)}>
        <motion.div {...stylex.props(styles.featureTitle)} style={{ opacity: title, y: titleY }}>
          <p {...stylex.props(styles.kicker, styles.center)}>{num(feature)}</p>
          <h2 {...stylex.props(styles.heading, styles.center)}>{feature.id}</h2>
        </motion.div>
        <motion.img {...stylex.props(styles.feature)} style={{ scale, rotate }} src={feature.src} alt="" />
      </div>
    </section>
  )
}

/* A contact sheet: every frame in a row, walked sideways by the scroll. */
function Sheet({ scrollY, rm }: { scrollY: MotionValue<number>; rm: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [max, setMax] = useState(0)
  const p = useProgress(ref, scrollY, 'pin')
  const x = useTransform(p, (v) => -v * max)
  // the mark rolls like a wheel along the track: one turn per ~150px
  const roll = useTransform(x, (v) => v * 2.4)
  useLayoutEffect(() => {
    const measure = () => track.current && setMax(Math.max(0, track.current.scrollWidth - window.innerWidth))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return (
    <section ref={ref} {...stylex.props(rm ? styles.section : styles.pin3)}>
      <div {...stylex.props(styles.sticky, rm && styles.native)}>
        <div {...stylex.props(styles.pad, styles.sheetHead)}>
          <div>
            <p {...stylex.props(styles.kicker)}>All {items.length}</p>
            <h2 {...stylex.props(styles.heading)}>
              Contact <em {...stylex.props(styles.em)}>sheet</em>
            </h2>
          </div>
          <motion.div style={{ rotate: roll }}>
            <DoanMark size={44} />
          </motion.div>
        </div>
        <motion.div ref={track} {...stylex.props(styles.track)} style={rm ? undefined : { x }}>
          {items.map((item, k) => (
            <figure key={item.id} {...stylex.props(styles.frame, k % 2 ? styles.tiltA : styles.tiltB)}>
              <img {...stylex.props(styles.frameImg)} style={{ aspectRatio: item.ratio }} src={item.src} alt="" />
              <figcaption {...stylex.props(styles.caption)}>
                <span>{num(item)}</span>
                <span {...stylex.props(styles.faint)}>{item.id}</span>
              </figcaption>
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* The last photograph holds while the footer slides up over it. */
function Closing({ onClose, onTop }: { onClose: () => void; onTop: () => void }) {
  return (
    <>
      <section {...stylex.props(styles.closing)}>
        <motion.img
          {...stylex.props(styles.closingImg)}
          src={closing.src}
          alt=""
          initial={{ scale: 1.18, rotate: 2 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 2.2, ease }}
        />
        <p {...stylex.props(styles.kicker, styles.closingCap)}>
          {num(closing)} · {closing.id}
        </p>
      </section>
      <footer {...stylex.props(styles.footer, styles.pad)}>
        <div {...stylex.props(styles.footerTop)}>
          <a href="https://doan-labs.com" {...stylex.props(styles.brand)}>
            <DoanMark size="min(12vw, 120px)" />
          </a>
          <nav {...stylex.props(styles.nav)}>
            <a href="https://doan-labs.com" {...stylex.props(styles.navItem)}>
              doan-labs.com
            </a>
            <button type="button" onClick={onTop} {...stylex.props(styles.navItem)}>
              Top
            </button>
            <button type="button" onClick={onClose} {...stylex.props(styles.navItem)}>
              Close
            </button>
          </nav>
        </div>
        <div {...stylex.props(styles.footerBottom)}>
          <span {...stylex.props(styles.wordmark)}>DOAN</span>
          <span {...stylex.props(styles.kicker, styles.noMargin)}>Linh · 2026</span>
        </div>
      </footer>
    </>
  )
}

export function Sections({
  scrollY,
  onClose,
  onTop,
}: {
  scrollY: MotionValue<number>
  onClose: () => void
  onTop: () => void
}) {
  const rm = !!useReducedMotion()
  return (
    <motion.div
      {...stylex.props(styles.root)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      <Statement scrollY={scrollY} />
      <Row />
      <Collage scrollY={scrollY} />
      <Ghost scrollY={scrollY} />
      <Feature scrollY={scrollY} />
      <Sheet scrollY={scrollY} rm={rm} />
      <Closing onClose={onClose} onTop={onTop} />
    </motion.div>
  )
}

const collagePos = stylex.create({
  0: { left: '12%', top: '0', width: 'min(24vw, 320px)' },
  1: { right: '10%', top: '12%', width: 'min(18vw, 240px)' },
  2: { left: '34%', bottom: '0', width: 'min(26vw, 360px)' },
})

const styles = stylex.create({
  root: {
    position: 'relative',
    zIndex: 5,
  },
  pad: {
    paddingLeft: '2.6vw',
    paddingRight: '2.6vw',
  },
  section: {
    position: 'relative',
    paddingTop: '14vh',
    paddingBottom: '14vh',
  },
  pin2: { position: 'relative', height: '200vh' },
  pin25: { position: 'relative', height: '250vh' },
  pin3: { position: 'relative', height: '300vh' },
  sticky: {
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflow: 'hidden',
  },
  native: {
    position: 'relative',
    height: 'auto',
    overflowX: 'auto',
  },
  kicker: {
    margin: '0 0 14px',
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: dark.inkMuted,
  },
  noMargin: { margin: 0 },
  heading: {
    margin: '0 0 6vh',
    fontFamily: font.serif,
    fontWeight: 400,
    fontSize: 'clamp(32px, 3.6vw, 56px)',
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  big: {
    fontSize: 'clamp(44px, 6vw, 96px)',
    lineHeight: 1,
    margin: '4vh 0 0',
  },
  em: {
    fontStyle: 'italic',
    color: dark.inkMuted,
  },
  center: { textAlign: 'center' },
  ch: {
    display: 'inline-block',
    willChange: 'transform, opacity, filter',
  },

  /* statement */
  statement: {
    position: 'absolute',
    left: '2.6vw',
    top: '12vh',
    margin: 0,
    maxWidth: '52vw',
  },
  word: { display: 'inline-block' },
  rule: {
    display: 'inline-block',
    width: 'clamp(60px, 8vw, 140px)',
    height: 1,
    margin: '0 0.3em',
    verticalAlign: 'middle',
    backgroundColor: dark.inkMuted,
    transformOrigin: 'left',
  },
  statementKick: {
    position: 'absolute',
    left: '2.6vw',
    bottom: '12vh',
  },
  statementImg: {
    position: 'absolute',
    right: '2.6vw',
    top: '50%',
    translate: '0 -50%',
    width: 'min(34vw, 480px)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
    aspectRatio: `${COLS} / ${ROWS}`,
  },
  cell: {
    backgroundRepeat: 'no-repeat',
    willChange: 'transform',
  },

  /* row */
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2vw',
  },
  figure: { margin: 0 },
  rowClip: {
    overflow: 'hidden',
  },
  rowImg: {
    width: '100%',
    aspectRatio: '1.15',
    objectFit: 'cover',
    backgroundColor: dark.surface,
  },
  caption: {
    display: 'flex',
    gap: 14,
    marginTop: 12,
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  faint: { color: dark.inkFaint },

  /* collage */
  collage: { height: '100vh' },
  collageImg: {
    position: 'absolute',
    objectFit: 'cover',
    aspectRatio: '1.3',
    backgroundColor: dark.surface,
  },
  collageMark: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    translate: '0 -50%',
    zIndex: 2,
    display: 'grid',
    justifyItems: 'center',
    textAlign: 'center',
    color: dark.ink,
  },

  /* ghost */
  ghost: {
    position: 'relative',
    height: '100vh',
    display: 'grid',
    alignContent: 'center',
    overflow: 'hidden',
  },
  ghostRow: {
    fontFamily: font.serif,
    fontWeight: 400,
    fontSize: '11vw',
    lineHeight: 1,
    letterSpacing: '-0.04em',
    textTransform: 'uppercase',
    color: dark.line,
    whiteSpace: 'nowrap',
    width: 'max-content',
    userSelect: 'none',
  },
  ghostOutline: {
    color: 'transparent',
    WebkitTextStrokeWidth: 1,
    WebkitTextStrokeColor: dark.lineStrong,
  },
  slash: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '130vw',
    height: 1,
    translate: '-50% -50%',
    backgroundColor: dark.inkFaint,
  },
  ghostKick: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '10vh',
    margin: 0,
  },

  /* feature */
  featureTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '10vh',
    zIndex: 2,
  },
  feature: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    backgroundColor: dark.surface,
    transformOrigin: 'center',
  },

  /* sheet */
  sheetHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: '10vh',
  },
  tiltA: { rotate: '1.4deg' },
  tiltB: { rotate: '-1.4deg' },
  track: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '2vw',
    paddingLeft: '2.6vw',
    paddingRight: '2.6vw',
    width: 'max-content',
  },
  frame: {
    margin: 0,
    flexShrink: 0,
  },
  frameImg: {
    height: '46vh',
    width: 'auto',
    objectFit: 'cover',
    backgroundColor: dark.surface,
  },

  /* closing */
  closing: {
    position: 'sticky',
    top: 0,
    height: '100vh',
    zIndex: 0,
  },
  closingImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  closingCap: {
    position: 'absolute',
    left: '2.6vw',
    bottom: '4vh',
    margin: 0,
    color: dark.ink,
    mixBlendMode: 'difference',
  },
  footer: {
    position: 'relative',
    zIndex: 1,
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: '10vh',
    paddingBottom: '4vh',
    backgroundColor: dark.paper,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: dark.line,
  },
  footerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  footerBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  brand: {
    color: dark.ink,
    textDecoration: 'none',
  },
  nav: {
    display: 'grid',
    justifyItems: 'end',
    gap: 6,
    textAlign: 'right',
  },
  navItem: {
    margin: 0,
    padding: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontFamily: font.serif,
    fontSize: 'clamp(28px, 3.2vw, 48px)',
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    color: {
      default: dark.inkFaint,
      ':hover': dark.ink,
    },
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.5s',
  },
  wordmark: {
    fontWeight: 600,
    fontSize: 28,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
})
