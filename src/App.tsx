import * as stylex from '@stylexjs/stylex'
import { ReactLenis, useLenis } from 'lenis/react'
import { AnimatePresence, motion, useMotionValue, useTransform, type MotionValue, type Variants } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { DoanMark } from './DoanMark'
import { Gallery } from './Gallery'
import { Loader } from './Loader'
import { Sections } from './Sections'
import { dark, font } from './tokens.stylex'

const titleV: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
}

const lineV: Variants = {
  hidden: { y: '45%', opacity: 0, filter: 'blur(10px)' },
  show: { y: '0%', opacity: 1, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
}

/* The mark sits behind everything in line colour and takes a slow quarter
   turn over the scroll, the same gesture as its hover. */
function Backdrop({ scrollY, expanded }: { scrollY: MotionValue<number>; expanded: boolean }) {
  const rotate = useTransform(scrollY, [0, 3000], [0, 90])
  return (
    <motion.div
      {...stylex.props(styles.backdrop)}
      style={{ rotate }}
      animate={{ scale: expanded ? 1.15 : 1 }}
      transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <DoanMark size="110vmin" />
    </motion.div>
  )
}

export default function App() {
  const [expanded, setExpanded] = useState(false)
  return (
    <ReactLenis {...stylex.props(styles.root, expanded && styles.scroll)} options={{ lerp: 0.08 }}>
      <Page expanded={expanded} setExpanded={setExpanded} />
    </ReactLenis>
  )
}

function Page({ expanded, setExpanded }: { expanded: boolean; setExpanded: (v: boolean) => void }) {
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const scrollY = useMotionValue(0)
  const lenis = useLenis((l) => scrollY.set(l.scroll))
  const toTop = () => lenis?.scrollTo(0, { duration: 1.6 })

  // the stack is a fixed scene, so scrolling only exists once expanded
  useEffect(() => {
    if (!lenis) return
    if (expanded) lenis.start()
    else {
      lenis.scrollTo(0, { immediate: true, force: true })
      lenis.stop()
    }
  }, [expanded, lenis])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setExpanded])

  const close = () => setExpanded(false)

  return (
    <>
      <AnimatePresence>{!ready && <Loader onDone={onReady} />}</AnimatePresence>
      <Backdrop scrollY={scrollY} expanded={expanded} />

      <header {...stylex.props(styles.header)}>
        <a href="https://doan-labs.com" {...stylex.props(styles.brand)}>
          <DoanMark size={22} />
          <span {...stylex.props(styles.wordmark)}>DOAN</span>
        </a>
        <AnimatePresence>
          {expanded && (
            <motion.button
              type="button"
              {...stylex.props(styles.iconBtn)}
              onClick={close}
              aria-label="Close"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <span {...stylex.props(styles.bar, styles.barA)} />
              <span {...stylex.props(styles.bar, styles.barB)} />
            </motion.button>
          )}
        </AnimatePresence>
      </header>

      <section {...stylex.props(styles.stage)}>
        {ready && <Gallery expanded={expanded} scrollY={scrollY} onExplore={() => setExpanded(true)} />}
        <div {...stylex.props(styles.titleWrap)}>
          <motion.p
            {...stylex.props(styles.kicker)}
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Linh · 2026
          </motion.p>
          <motion.h1 {...stylex.props(styles.title)} initial="hidden" animate={ready ? 'show' : 'hidden'} variants={titleV}>
            <motion.span {...stylex.props(styles.line)} variants={lineV}>
              Photographs
            </motion.span>
          </motion.h1>
        </div>
      </section>

      <AnimatePresence>{expanded && <Sections scrollY={scrollY} onClose={close} onTop={toTop} />}</AnimatePresence>
    </>
  )
}

const styles = stylex.create({
  root: {
    position: 'fixed',
    inset: 0,
    overflow: 'hidden',
    backgroundColor: dark.paper,
    color: dark.ink,
    fontFamily: font.sans,
    userSelect: 'none',
    scrollbarWidth: 'none',
  },
  scroll: {
    overflowY: 'auto',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    // flex centres an item taller than the viewport, grid would pin it to the top
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: dark.line,
    pointerEvents: 'none',
  },
  stage: {
    position: 'relative',
    height: '100vh',
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '3.6vh 2.2vw',
    pointerEvents: 'none',
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    color: dark.ink,
    textDecoration: 'none',
    pointerEvents: 'auto',
  },
  wordmark: {
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  iconBtn: {
    position: 'relative',
    width: 34,
    height: 34,
    borderStyle: 'none',
    padding: 0,
    pointerEvents: 'auto',
    cursor: 'pointer',
    backgroundColor: {
      default: dark.ink,
      ':hover': '#ffffff',
    },
    color: dark.paper,
    transition: 'background-color 0.5s',
  },
  bar: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 12,
    height: 1.25,
    backgroundColor: 'currentColor',
  },
  barA: { transform: 'translate(-50%, -50%) rotate(45deg)' },
  barB: { transform: 'translate(-50%, -50%) rotate(-45deg)' },
  titleWrap: {
    position: 'absolute',
    left: '2.6vw',
    bottom: '5vh',
    zIndex: 20,
    pointerEvents: 'none',
  },
  kicker: {
    margin: '0 0 14px',
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: dark.inkMuted,
  },
  title: {
    margin: 0,
    fontWeight: 600,
    fontSize: 'clamp(40px, 5.2vw, 84px)',
    lineHeight: 1,
    letterSpacing: '-0.035em',
  },
  line: {
    display: 'block',
  },
})
