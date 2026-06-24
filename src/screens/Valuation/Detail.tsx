import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X,
  Sparkles,
  ChevronDown,
  ChevronRight,
  StickyNote,
  BarChart3,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react'
import CarPhoto from '../../components/CarPhoto'
import MarketStats from './MarketStats'
import {
  deriveValuation,
  benchmarkFor,
  optionById,
  eur,
  km as fmtKm,
  type BenchmarkSubject,
} from '../../data/mock'
import './Detail.css'

export interface DetailSubject extends BenchmarkSubject {
  fuel?: string
  note?: string
  date?: string
}

function Row({ k, v, tone }: { k: string; v: string; tone?: 'pos' | 'neg' }) {
  return (
    <div className="rrow">
      <span className="rrow__k">{k}</span>
      <span className={`rrow__v ${tone ? `rrow__v--${tone}` : ''}`}>{v}</span>
    </div>
  )
}

export default function Detail({
  subject,
  onClose,
  openBenchmark,
}: {
  subject: DetailSubject
  onClose: () => void
  openBenchmark: (subject: BenchmarkSubject) => void
}) {
  const [optsOpen, setOptsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const result = useMemo(() => deriveValuation(subject), [subject])
  const bench = useMemo(() => benchmarkFor(subject), [subject])
  const oursListing = bench.listings.find((l) => l.isOurs)

  return (
    <motion.div
      className="detail bench"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="bench__top">
        <div className="bench__bar">
          <button className="val__back" onClick={onClose} aria-label="Close">
            <X width={20} height={20} />
          </button>
          <span className="bench__title">Valuation</span>
          <div className="detail-menu">
            <button
              className={`val__back ${menuOpen ? 'is-active' : ''}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Options"
              aria-expanded={menuOpen}
            >
              <MoreVertical width={20} height={20} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <>
                  <button
                    className="detail-menu__scrim"
                    aria-hidden
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    className="detail-menu__pop"
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button className="detail-menu__item" onClick={() => setMenuOpen(false)}>
                      <Pencil width={16} height={16} /> Edit details
                    </button>
                    <button className="detail-menu__item" onClick={() => setMenuOpen(false)}>
                      <Share2 width={16} height={16} /> Share valuation
                    </button>
                    <span className="detail-menu__sep" />
                    <button
                      className="detail-menu__item detail-menu__item--danger"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Trash2 width={16} height={16} /> Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="detail__body no-scrollbar">
        <CarPhoto
          make={subject.make}
          model={subject.model}
          className="carphoto--sm reveal-photo"
        />
        <div className="reveal">
          <span className="reveal__ctx">
            {subject.make} {subject.model}
            {subject.plate ? ` · ${subject.plate}` : ''} · {fmtKm(subject.mileage)}
          </span>
          <span className="reveal__label">
            <Sparkles width={15} height={15} /> Estimated value
          </span>
          <span className="reveal__price">{eur(result.price)}</span>
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
              disabled={subject.options.length === 0}
            >
              <span className="rrow__k rrow__k--opts">
                Options ({subject.options.length})
                {subject.options.length > 0 && (
                  <ChevronDown width={15} height={15} className="rrow__chev" />
                )}
              </span>
              <span className="rrow__v rrow__v--pos">{'+ ' + eur(result.optionsAdj)}</span>
            </button>
            <AnimatePresence initial={false}>
              {optsOpen && subject.options.length > 0 && (
                <motion.div
                  className="rrow__opts"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="rrow__opts-inner">
                    {subject.options.map((id) => {
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

        {oursListing && <MarketStats etr={oursListing.etr} apr={oursListing.apr} />}

        <button className="bench-cta" onClick={() => openBenchmark(subject)}>
          <span className="bench-cta__icon">
            <BarChart3 width={19} height={19} />
          </span>
          <span className="bench-cta__text">
            <span className="bench-cta__title">View benchmark</span>
            <span className="bench-cta__sub">
              Ranked #{bench.ourRank} of {bench.total} comparable cars
            </span>
          </span>
          <ChevronRight width={18} height={18} className="bench-cta__chev" />
        </button>

        {subject.note && (
          <div className="detail__note">
            <span className="detail__note-label">
              <StickyNote width={15} height={15} /> Note
            </span>
            <p className="detail__note-text">{subject.note}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
