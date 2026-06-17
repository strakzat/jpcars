import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gauge,
  Pencil,
  Sparkles,
  BookmarkPlus,
  RotateCcw,
  Plus,
  ChevronRight,
  ChevronDown,
  StickyNote,
} from 'lucide-react'
import BrandMark from '../../components/BrandMark'
import { useReview } from '../../review/ReviewContext'
import {
  options as ALL_OPTIONS,
  optionById,
  lookupVehicle,
  calcValuation,
  eur,
  km as fmtKm,
  type Vehicle,
  type SavedValuation,
} from '../../data/mock'
import './Valuation.css'

type Step = 1 | 2 | 3 | 4

const STEP_SHOTS: Record<Step, { src: string; label: string }> = {
  1: { src: '/current/plate.png', label: 'Current — License plate' },
  2: { src: '/current/mileage.png', label: 'Current — Mileage' },
  3: { src: '/current/options.png', label: 'Current — Options' },
  4: { src: '/current/options.png', label: 'Current — no result screen' },
}

const todayLabel = () =>
  new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/* Animated count-up for the price reveal */
function useCountUp(target: number, run: boolean, duration = 1100) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf = 0
    let t0: number | null = null
    const tick = (t: number) => {
      if (t0 === null) t0 = t
      const p = Math.min(1, (t - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, run, duration])
  return val
}

export default function Valuation({
  recent,
  onSaved,
  goToSaved,
  onFlowChange,
}: {
  recent: SavedValuation[]
  onSaved: (v: SavedValuation) => void
  goToSaved: () => void
  onFlowChange: (inFlow: boolean) => void
}) {
  const { setCurrentShot } = useReview()
  const [phase, setPhase] = useState<'home' | 'flow'>('home')
  const [step, setStep] = useState<Step>(1)
  const [dir, setDir] = useState(1)
  const [plate, setPlate] = useState('')
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [mileage, setMileage] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [savedDone, setSavedDone] = useState(false)
  const [optsOpen, setOptsOpen] = useState(false)

  useEffect(() => {
    if (phase === 'home') setCurrentShot({ src: '/current/plate.png', label: 'Current — Valuation' })
    else setCurrentShot(STEP_SHOTS[step])
  }, [phase, step, setCurrentShot])

  useEffect(() => {
    onFlowChange(phase === 'flow')
  }, [phase, onFlowChange])

  const startNew = () => {
    setPlate('')
    setVehicle(null)
    setMileage('')
    setSelected([])
    setNote('')
    setSavedDone(false)
    setStep(1)
    setDir(1)
    setPhase('flow')
  }

  const go = (next: Step) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const resolveVehicle = (withPlate: string) => {
    const v = lookupVehicle(withPlate)
    setVehicle(v)
    setSelected(v.defaultOptions)
    return v
  }

  const startFromPlate = () => {
    resolveVehicle(plate)
    go(2)
  }
  const startWithoutPlate = () => {
    setPlate('')
    resolveVehicle('')
    go(2)
  }

  const toggleOption = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const mileageNum = mileage ? parseInt(mileage.replace(/\D/g, ''), 10) : null

  const result = useMemo(() => {
    if (!vehicle) return null
    return calcValuation(vehicle, mileageNum, selected)
  }, [vehicle, mileageNum, selected])

  const reset = () => {
    setPlate('')
    setVehicle(null)
    setMileage('')
    setSelected([])
    setNote('')
    setSavedDone(false)
    setOptsOpen(false)
    go(1)
  }

  const save = () => {
    if (!vehicle || !result) return
    onSaved({
      id: 'v' + Date.now(),
      make: vehicle.make,
      model: vehicle.model,
      variant: vehicle.variant,
      year: vehicle.year,
      fuel: vehicle.fuel,
      plate: vehicle.plate || '—',
      mileage: mileageNum ?? vehicle.expectedMileage,
      price: result.price,
      gross: result.gross,
      date: todayLabel(),
      options: selected,
      note: note.trim() || undefined,
    })
    setSavedDone(true)
    setTimeout(goToSaved, 650)
  }

  const canContinuePlate = plate.replace(/\W/g, '').length >= 4
  const animatedPrice = useCountUp(result?.price ?? 0, step === 4)

  /* ── Landing / home ───────────────────────────────────────────────── */
  if (phase === 'home') {
    return (
      <div className="vhome">
        <header className="screen-top">
          <div className="screen-top__bar">
            <h1 className="screen-top__title">Valuation</h1>
          </div>
        </header>

        <div className="vhome__body">
          <div className="vhome__recent-head">
            <span className="vhome__recent-label">Recent</span>
            {recent.length > 0 && (
              <button className="vhome__seeall" onClick={goToSaved}>
                See all
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="vhome__empty">No valuations yet — start your first one above.</p>
          ) : (
            <div className="vhome__list">
              {recent.slice(0, 5).map((it) => (
                <button key={it.id} className="recent" onClick={goToSaved}>
                  <BrandMark make={it.make} size={40} />
                  <span className="recent__info">
                    <span className="recent__name">
                      {it.make} {it.model}
                    </span>
                    <span className="recent__variant">{it.variant}</span>
                    <span className="recent__meta">
                      <span>{it.year}</span>
                      <span className="dot" />
                      <span>{it.fuel}</span>
                      <span className="dot" />
                      <span>{fmtKm(it.mileage)}</span>
                    </span>
                  </span>
                  <span className="recent__val">{eur(it.gross)}</span>
                  <ChevronRight width={17} height={17} className="recent__chev" />
                </button>
              ))}
            </div>
          )}
        </div>

        <footer className="vhome__cta">
          <button className="btn btn--primary" onClick={startNew}>
            <Plus width={18} height={18} strokeWidth={2.4} /> New valuation
          </button>
        </footer>
      </div>
    )
  }

  /* ── Guided flow ──────────────────────────────────────────────────── */
  return (
    <div className="val">
      <header className="val__top">
        <div className="val__bar">
          <button
            className="val__back"
            onClick={() => (step > 1 ? go((step - 1) as Step) : setPhase('home'))}
            aria-label="Back"
          >
            <ArrowLeft width={20} height={20} />
          </button>
          <span className="val__title">Valuation</span>
          <button className="val__reset" onClick={reset} aria-label="Reset">
            <RotateCcw width={17} height={17} />
          </button>
        </div>
        <div className="val__steps" aria-hidden>
          {[1, 2, 3, 4].map((s) => (
            <span key={s} className={`val__step ${step >= s ? 'is-done' : ''}`} />
          ))}
        </div>
      </header>

      <div className="val__body">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            className="val__step-content"
            custom={dir}
            initial={{ opacity: 0, x: dir * 22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -22 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── Step 1 — License plate ─────────────────────────────── */}
            {step === 1 && (
              <div className="step">
                <h1 className="step__h">What are we valuing?</h1>
                <p className="step__sub">
                  Enter the license plate — we’ll pull the make, model and specs automatically.
                </p>

                <label className="plate" aria-label="License plate">
                  <span className="plate__eu">
                    <span className="plate__stars">★</span>
                    <span className="plate__nl">NL</span>
                  </span>
                  <input
                    className="plate__input"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase().slice(0, 8))}
                    placeholder="XX-NNN-X"
                    inputMode="text"
                    autoCapitalize="characters"
                    spellCheck={false}
                  />
                </label>

                <p className="step__try">
                  Try <button onClick={() => setPlate('50-TDK-3')}>50-TDK-3</button>,{' '}
                  <button onClick={() => setPlate('Z-445-BN')}>Z-445-BN</button> or any plate.
                </p>
              </div>
            )}

            {/* ── Step 2 — Vehicle + mileage ─────────────────────────── */}
            {step === 2 && vehicle && (
              <div className="step">
                <span className="step__found">
                  <Check width={14} height={14} /> Vehicle found
                </span>
                <div className="vcard">
                  <BrandMark make={vehicle.make} size={50} />
                  <div className="vcard__info">
                    <span className="vcard__name">
                      {vehicle.make} {vehicle.model}
                    </span>
                    <span className="vcard__variant">{vehicle.variant}</span>
                    <div className="vcard__meta">
                      <span>{vehicle.year}</span>
                      <span className="dot" />
                      <span>{vehicle.fuel}</span>
                      {vehicle.plate && (
                        <>
                          <span className="dot" />
                          <span className="vcard__plate">{vehicle.plate}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button className="vcard__edit" onClick={() => go(1)}>
                    <Pencil width={13} height={13} /> Edit
                  </button>
                </div>

                <div className="field">
                  <span className="field__label">
                    <Gauge width={16} height={16} /> Mileage
                  </span>
                  <div className="field__input">
                    <input
                      value={mileage}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 7)
                        setMileage(digits ? parseInt(digits, 10).toLocaleString('nl-NL') : '')
                      }}
                      placeholder="0"
                      inputMode="numeric"
                    />
                    <span className="field__suffix">km</span>
                  </div>
                  <span className="field__hint">
                    Typical for this car: ~{vehicle.expectedMileage.toLocaleString('nl-NL')} km
                  </span>
                </div>
              </div>
            )}

            {/* ── Step 3 — Options ───────────────────────────────────── */}
            {step === 3 && (
              <div className="step">
                <h1 className="step__h">Confirm the options</h1>
                <p className="step__sub">Tap everything this car has. We pre-selected the usual specs.</p>
                <div className="opts">
                  {ALL_OPTIONS.map((o) => {
                    const on = selected.includes(o.id)
                    return (
                      <button
                        key={o.id}
                        className={`opt ${on ? 'is-on' : ''}`}
                        onClick={() => toggleOption(o.id)}
                        aria-pressed={on}
                      >
                        <span className="opt__check">{on && <Check width={13} height={13} strokeWidth={3} />}</span>
                        <o.Icon className="opt__icon" width={20} height={20} />
                        <span className="opt__label">{o.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Step 4 — Result / price reveal ─────────────────────── */}
            {step === 4 && vehicle && result && (
              <div className="step">
                <div className="reveal">
                  <span className="reveal__ctx">
                    {vehicle.make} {vehicle.model}
                    {vehicle.plate ? ` · ${vehicle.plate}` : ''} · {fmtKm(mileageNum ?? vehicle.expectedMileage)}
                  </span>
                  <span className="reveal__label">
                    <Sparkles width={15} height={15} /> Estimated value
                  </span>
                  <span className="reveal__price">{eur(animatedPrice)}</span>
                </div>

                <div className="result-card">
                  <div className="result-card__main">
                    <div>
                      <span className="result-card__k">Recommended purchase</span>
                      <span className="result-card__v">{eur(result.gross)}</span>
                    </div>
                    <span className="result-card__margin">{eur(result.margin)} margin</span>
                  </div>
                  <div className="result-card__rows">
                    <Row k="Market value" v={eur(result.price)} />
                    <Row k="Base price" v={eur(result.base)} />
                    <Row
                      k="Mileage adjustment"
                      v={(result.mileageAdj >= 0 ? '+ ' : '− ') + eur(Math.abs(result.mileageAdj))}
                      tone={result.mileageAdj >= 0 ? 'pos' : 'neg'}
                    />
                    <button
                      className={`rrow rrow--opts ${optsOpen ? 'is-open' : ''}`}
                      onClick={() => setOptsOpen((o) => !o)}
                      aria-expanded={optsOpen}
                      disabled={selected.length === 0}
                    >
                      <span className="rrow__k rrow__k--opts">
                        Options ({selected.length})
                        {selected.length > 0 && (
                          <ChevronDown width={15} height={15} className="rrow__chev" />
                        )}
                      </span>
                      <span className="rrow__v rrow__v--pos">{'+ ' + eur(result.optionsAdj)}</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {optsOpen && selected.length > 0 && (
                        <motion.div
                          className="rrow__opts"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="rrow__opts-inner">
                            {selected.map((id) => {
                              const o = optionById[id]
                              if (!o) return null
                              return (
                                <span key={id} className="chip">
                                  <o.Icon className="chip__icon" width={13} height={13} />
                                  {o.label}
                                </span>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="note-field">
                  <label className="note-field__label" htmlFor="val-note">
                    <StickyNote width={15} height={15} /> Note
                    <span className="note-field__opt">optional</span>
                  </label>
                  <textarea
                    id="val-note"
                    className="note-field__input"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Condition, damage, asking price…"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Sticky CTA ───────────────────────────────────────────────── */}
      <footer className="val__cta">
        {step === 1 && (
          <>
            <button className="btn btn--primary" disabled={!canContinuePlate} onClick={startFromPlate}>
              Continue <ArrowRight width={18} height={18} />
            </button>
            <button className="btn btn--ghost" onClick={startWithoutPlate}>
              Valuate without a plate
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <button className="btn btn--primary" onClick={() => go(3)}>
              Continue <ArrowRight width={18} height={18} />
            </button>
            <button className="btn btn--ghost" onClick={() => { setMileage(''); go(3) }}>
              Valuate without mileage
            </button>
          </>
        )}
        {step === 3 && (
          <button className="btn btn--primary btn--lg" onClick={() => go(4)}>
            <Sparkles width={18} height={18} /> Valuate
          </button>
        )}
        {step === 4 && (
          <>
            <button
              className={`btn btn--primary ${savedDone ? 'is-done' : ''}`}
              onClick={save}
              disabled={savedDone}
            >
              {savedDone ? (
                <><Check width={18} height={18} /> Saved</>
              ) : (
                <><BookmarkPlus width={18} height={18} /> Save valuation</>
              )}
            </button>
            <button className="btn btn--ghost" onClick={reset}>
              New valuation
            </button>
          </>
        )}
      </footer>
    </div>
  )
}

function Row({ k, v, tone }: { k: string; v: string; tone?: 'pos' | 'neg' }) {
  return (
    <div className="rrow">
      <span className="rrow__k">{k}</span>
      <span className={`rrow__v ${tone ? `rrow__v--${tone}` : ''}`}>{v}</span>
    </div>
  )
}
