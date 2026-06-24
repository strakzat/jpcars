import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Plus, StickyNote, ChevronDown, BarChart3 } from 'lucide-react'
import BrandMark from '../../components/BrandMark'
import { useReview } from '../../review/ReviewContext'
import {
  eur,
  km as fmtKm,
  optionById,
  benchmarkFor,
  type SavedValuation,
  type BenchmarkSubject,
} from '../../data/mock'
import './Saved.css'

export default function Saved({
  items,
  onNew,
  openBenchmark,
  openDetail,
}: {
  items: SavedValuation[]
  onNew: () => void
  openBenchmark: (subject: BenchmarkSubject) => void
  openDetail: (it: SavedValuation) => void
}) {
  const { setCurrentShot } = useReview()
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    setCurrentShot({ src: '/current/saved.png', label: 'Current — Saved valuations' })
  }, [setCurrentShot])

  const filtered = items.filter((i) => {
    const hay = `${i.make} ${i.model} ${i.variant} ${i.plate}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  return (
    <div className="saved">
      <header className="screen-top">
        <div className="screen-top__bar">
          <div>
            <h1 className="screen-top__title">Saved</h1>
            <span className="screen-top__count">{items.length} valuations</span>
          </div>
          <button className="screen-top__new" onClick={onNew}>
            <Plus width={18} height={18} /> New
          </button>
        </div>
        <div className="search">
          <Search width={17} height={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search make, model or plate"
          />
        </div>
      </header>

      <div className="saved__list">
        {filtered.map((it) => {
          const open = openId === it.id
          const subject: BenchmarkSubject = {
            make: it.make,
            model: it.model,
            variant: it.variant,
            year: it.year,
            plate: it.plate === '—' ? '' : it.plate,
            mileage: it.mileage,
            options: it.options,
            price: it.price,
            gross: it.gross,
          }
          const bench = benchmarkFor(subject)
          const etr = bench.listings.find((l) => l.isOurs)?.etr
          return (
            <article
              key={it.id}
              className="svcard"
              role="button"
              tabIndex={0}
              onClick={() => openDetail(it)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openDetail(it)
                }
              }}
            >
              <div className="svcard__head">
                <BrandMark make={it.make} model={it.model} size={44} />
                <div className="svcard__id">
                  <span className="svcard__name">
                    {it.make} {it.model}
                  </span>
                  <span className="svcard__variant">{it.variant}</span>
                </div>
                <span className="svcard__date">{it.date}</span>
              </div>

              <div className="svcard__specs">
                <span className="svcard__plate">{it.plate}</span>
                <span className="dot" />
                <span>{it.year}</span>
                <span className="dot" />
                <span>{it.fuel}</span>
                <span className="dot" />
                <span>{fmtKm(it.mileage)}</span>
              </div>

              <div className="svcard__prices">
                <div className="svcard__price">
                  <span className="svcard__price-k">Value</span>
                  <span className="svcard__price-v">{eur(it.price)}</span>
                </div>
                <div className="svcard__price svcard__price--gross">
                  <span className="svcard__price-k">Purchase</span>
                  <span className="svcard__price-v">{eur(it.gross)}</span>
                </div>
                <div className="svcard__price">
                  <span className="svcard__price-k">Margin</span>
                  <span className="svcard__price-v">{eur(it.price - it.gross)}</span>
                </div>
              </div>

              <div className="svcard__badges">
                <span className="svcard__etr">
                  ETR <b>{etr}</b>
                </span>
                <button
                  className="svcard__bench"
                  onClick={(e) => {
                    e.stopPropagation()
                    openBenchmark(subject)
                  }}
                  aria-label="View benchmark"
                >
                  <BarChart3 width={14} height={14} /> #{bench.ourRank} of {bench.total}
                </button>
                <button
                  className={`opts-pill ${open ? 'is-open' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenId(open ? null : it.id)
                  }}
                  aria-expanded={open}
                >
                  {it.options.length} options
                  <ChevronDown width={14} height={14} className="opts-pill__chev" />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    className="svcard__opts"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="svcard__opts-inner">
                      {it.options.map((id) => {
                        const o = optionById[id]
                        if (!o) return null
                        return (
                          <span key={id} className="opt-chip">
                            <o.Icon width={13} height={13} />
                            {o.label}
                          </span>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {it.note && (
                <p className="svcard__note">
                  <StickyNote width={14} height={14} />
                  <span>{it.note}</span>
                </p>
              )}
            </article>
          )
        })}

        {filtered.length === 0 && (
          <div className="saved__empty">
            <Search width={26} height={26} />
            <p>No valuations match “{q}”.</p>
          </div>
        )}
      </div>
    </div>
  )
}
