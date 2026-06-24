import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useReview } from './ReviewContext'
import { ANNOTATIONS, type AnnotationDef } from './annotations'
import './AnnotationLayer.css'

/* Width of the notes column and the gap it keeps from the phone. The column
   sits right next to the phone; if it wouldn't fit there we fall back to
   on-screen markers that expand a panel on tap. */
const COL_W = 280
const COL_GAP = 22

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

function bind<T>(map: React.MutableRefObject<Map<number, T>>, n: number, el: T | null) {
  if (el) map.current.set(n, el)
  else map.current.delete(n)
}

const defByN = (n: number) => ANNOTATIONS.find((a) => a.n === n)!

/**
 * A toggleable overlay with notes on the prototype's design. Notes sit in a
 * column just beside the phone, each linked to its element with a curved
 * connector from a small marker — no numbers, since the elements live across
 * different screens and a lone "4" with no "1, 2, 3" in view reads oddly. When
 * there's no room for the column, it falls back to on-screen markers that
 * expand a panel on tap. Positions are remeasured every frame so the notes
 * track scrolling and screen transitions.
 */
export default function AnnotationLayer() {
  const { annotationsOn } = useReview()
  const [active, setActive] = useState<number[]>([])
  const [mode, setMode] = useState<'column' | 'markers'>('column')
  const [openN, setOpenN] = useState<number | null>(null)

  const colRef = useRef<HTMLDivElement>(null)
  const markerRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const pathRefs = useRef<Map<number, SVGPathElement>>(new Map())

  useEffect(() => {
    if (!annotationsOn) {
      setActive([])
      setOpenN(null)
      return
    }

    let raf = 0
    let lastKey = ''
    let lastMode = ''

    const run = () => {
      const appRoot = document.getElementById('device-app')
      if (appRoot) {
        const clip = appRoot.getBoundingClientRect()
        const vw = window.innerWidth
        const vh = window.innerHeight

        // The column sits at the phone's right edge; use it only if it fits
        // there without running off the viewport.
        const colLeft = clip.right + COL_GAP
        const nextMode = colLeft + COL_W + 12 <= vw ? 'column' : 'markers'
        if (nextMode !== lastMode) {
          lastMode = nextMode
          setMode(nextMode)
        }

        // A full-screen overlay (benchmark or detail — both use `.bench`) covers
        // the tab screen behind it. While one is open, only notes whose element
        // lives inside it should show. Use the last match so a freshly opened
        // overlay wins over one still animating out.
        const overlays = appRoot.querySelectorAll('.bench')
        const overlay = overlays.length ? (overlays[overlays.length - 1] as HTMLElement) : null

        type Found = { def: AnnotationDef; ax: number; ay: number }
        const found: Found[] = []

        for (const def of ANNOTATIONS) {
          const el = appRoot.querySelector(def.selector) as HTMLElement | null
          if (!el) continue
          if (overlay && !overlay.contains(el)) continue
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue

          const cy =
            def.at === 'top' ? r.top + Math.min(44, r.height / 2) : r.top + r.height / 2

          // The anchor must sit inside the phone viewport — hides notes whose
          // element is scrolled past the fold.
          if (cy < clip.top + 8 || cy > clip.bottom - 8) continue
          // And the element must be the thing actually painted there — hides
          // notes covered by something on the same screen, e.g. a bottom sheet
          // drawn over the benchmark list.
          const hx = clamp(r.left + Math.min(24, r.width / 2), clip.left + 3, clip.right - 3)
          const top = document.elementFromPoint(hx, cy)
          if (!top || !(el.contains(top) || top.contains(el))) continue

          found.push({ def, ax: Math.min(r.right, clip.right) - 9, ay: cy })
        }

        found.sort((a, b) => a.ay - b.ay)
        const key = found.map((f) => f.def.n).join(',')
        if (key !== lastKey) {
          lastKey = key
          setActive(found.map((f) => f.def.n))
        }

        // Markers sit on the element edge regardless of mode.
        for (const f of found) {
          const m = markerRefs.current.get(f.def.n)
          if (m) m.style.transform = `translate(${f.ax}px, ${f.ay}px) translate(-50%, -50%)`
        }

        // Column mode: pin the column beside the phone, stack the cards near
        // their element's height, de-overlap by pushing each below the previous,
        // then curve a line to it.
        if (nextMode === 'column') {
          if (colRef.current) colRef.current.style.left = `${colLeft}px`
          let cursor = clamp(clip.top - 4, 16, vh)
          for (const f of found) {
            const card = cardRefs.current.get(f.def.n)
            const path = pathRefs.current.get(f.def.n)
            const h = card ? card.offsetHeight : 88
            const y = clamp(f.ay - h / 2, cursor, vh - h - 16)
            cursor = y + h + 12
            if (card) card.style.transform = `translateY(${y}px)`
            if (path) {
              const x1 = f.ax + 7
              const y1 = f.ay
              const x2 = colLeft
              const y2 = y + h / 2
              const mx = x1 + (x2 - x1) * 0.5
              path.setAttribute('d', `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`)
            }
          }
        }
      }
      raf = requestAnimationFrame(run)
    }

    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [annotationsOn])

  if (!annotationsOn) return null

  const panelN = mode === 'markers' && openN != null && active.includes(openN) ? openN : null

  return (
    <div className={`annot annot--${mode}`}>
      {mode === 'column' && (
        <svg className="annot__svg" aria-hidden>
          {active.map((n) => (
            <path
              key={n}
              ref={(el) => bind(pathRefs, n, el)}
              className="annot__path"
              fill="none"
            />
          ))}
        </svg>
      )}

      {active.map((n) => (
        <button
          key={n}
          ref={(el) => bind(markerRefs, n, el)}
          className={`annot__marker ${panelN === n ? 'is-open' : ''}`}
          onClick={() => mode === 'markers' && setOpenN(openN === n ? null : n)}
          tabIndex={mode === 'markers' ? 0 : -1}
          aria-label={defByN(n).title}
        />
      ))}

      {mode === 'column' && (
        <div className="annot__col" ref={colRef}>
          {active.map((n) => {
            const d = defByN(n)
            return (
              <div key={n} ref={(el) => bind(cardRefs, n, el)} className="annot__card">
                <span className="annot__c-title">{d.title}</span>
                <p className="annot__c-text">{d.body}</p>
              </div>
            )
          })}
        </div>
      )}

      {panelN != null && (
        <div className="annot__panel">
          <button
            className="annot__panel-close"
            onClick={() => setOpenN(null)}
            aria-label="Sluit"
          >
            <X width={16} height={16} />
          </button>
          <div className="annot__c-body">
            <span className="annot__c-title">{defByN(panelN).title}</span>
            <p className="annot__c-text">{defByN(panelN).body}</p>
          </div>
        </div>
      )}
    </div>
  )
}
