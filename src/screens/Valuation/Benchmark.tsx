import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Info, MapPin, Flame, Store, ExternalLink } from 'lucide-react'
import BrandMark from '../../components/BrandMark'
import CarPhoto from '../../components/CarPhoto'
import { useReview } from '../../review/ReviewContext'
import {
  benchmarkFor,
  optionDiff,
  optionById,
  eur,
  km as fmtKm,
  type BenchmarkSubject,
  type BenchmarkListing,
} from '../../data/mock'
import './Benchmark.css'

const ETR_WORD: Record<number, string> = {
  5: 'Very hot',
  4: 'Hot',
  3: 'Average',
  2: 'Slow',
  1: 'Cold',
}

function AprBar({ apr }: { apr: number }) {
  return (
    <div className="apr">
      <span className="apr__cap">APR {apr}%</span>
      <span className="apr__track">
        <span className="apr__fill" style={{ width: `${apr}%` }} />
      </span>
    </div>
  )
}

function OptionDiff({
  ours,
  listing,
  isOurs,
}: {
  ours: string[]
  listing: string[]
  isOurs?: boolean
}) {
  if (isOurs) {
    return <span className="diff diff--same">{listing.length} options</span>
  }
  const { extra, missing } = optionDiff(ours, listing)
  if (extra.length === 0 && missing.length === 0) {
    return <span className="diff diff--same">same spec</span>
  }
  return (
    <span className="diff">
      {extra.length > 0 && <span className="diff__pos">+{extra.length}</span>}
      {missing.length > 0 && <span className="diff__neg">−{missing.length}</span>}
      <span className="diff__cap">options</span>
    </span>
  )
}

function MarginBar({ gross, price }: { gross: number; price: number }) {
  const margin = price - gross
  return (
    <div className="margin">
      <div className="margin__col">
        <span className="margin__cap">Purchase</span>
        <span className="margin__v">{eur(gross)}</span>
      </div>
      <div className="margin__col">
        <span className="margin__cap">Price</span>
        <span className="margin__v">{eur(price)}</span>
      </div>
      <div className="margin__col margin__col--accent">
        <span className="margin__cap">Margin</span>
        <span className="margin__v">{eur(margin)}</span>
      </div>
    </div>
  )
}

function BenchRow({
  listing,
  ours,
  rank,
  onOpen,
  rowRef,
}: {
  listing: BenchmarkListing
  ours: string[]
  rank: number
  onOpen: () => void
  rowRef?: React.Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={rowRef}
      className={`bench-row ${listing.isOurs ? 'is-ours' : ''}`}
      onClick={onOpen}
    >
      {listing.isOurs && (
        <span className="bench-row__you">
          <MapPin width={12} height={12} /> YOUR CAR
        </span>
      )}

      <div className="bench-row__title">
        <span className="bench-row__rank">#{rank}</span>
        <span className="bench-row__name">
          {listing.make} {listing.model} {listing.variant}
        </span>
      </div>

      <div className="bench-row__body">
        <div className="bench-row__stack">
          <span className="bench-row__meta">
            {listing.year} · {fmtKm(listing.mileage)}
          </span>
          <span className="bench-row__opts">
            <OptionDiff ours={ours} listing={listing.options} isOurs={listing.isOurs} />
          </span>
        </div>
        <span className={`etr etr--${listing.etr}`}>
          <span className="etr__val">{listing.etr}</span>
          <span className="etr__cap">ETR</span>
        </span>
      </div>

      <AprBar apr={listing.apr} />

      <MarginBar gross={listing.gross} price={listing.price} />
    </button>
  )
}

/* ── Sheet chrome (shared by detail + legend) ───────────────────────────── */
function Sheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <motion.div
        className="sheet__scrim"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
      />
      <motion.div
        className="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose()
        }}
      >
        <span className="sheet__handle" />
        {children}
      </motion.div>
    </>
  )
}

function MetricTile({
  k,
  v,
  sub,
  tone,
}: {
  k: string
  v: string
  sub?: string
  tone?: 'accent'
}) {
  return (
    <div className="mtile">
      <span className="mtile__k">{k}</span>
      <span className={`mtile__v ${tone === 'accent' ? 'mtile__v--accent' : ''}`}>{v}</span>
      {sub && <span className="mtile__sub">{sub}</span>}
    </div>
  )
}

function ChipList({ ids, kind }: { ids: string[]; kind: 'shared' | 'extra' | 'missing' }) {
  if (ids.length === 0) return <span className="optgroup__empty">None</span>
  return (
    <div className="optgroup__chips">
      {ids.map((id) => {
        const o = optionById[id]
        if (!o) return null
        return (
          <span key={id} className={`bchip bchip--${kind}`}>
            <o.Icon width={13} height={13} />
            {o.label}
          </span>
        )
      })}
    </div>
  )
}

function BenchmarkSheet({
  listing,
  rank,
  total,
  ours,
  onClose,
}: {
  listing: BenchmarkListing
  rank: number
  total: number
  ours: string[]
  onClose: () => void
}) {
  const diff = optionDiff(ours, listing.options)
  const margin = listing.price - listing.gross
  return (
    <Sheet onClose={onClose}>
      <div className="sheet__head">
        {listing.isOurs ? (
          <BrandMark make={listing.make} model={listing.model} size={46} />
        ) : (
          <CarPhoto make={listing.make} model={listing.model} className="sheet__photo" />
        )}
        <div className="sheet__id">
          <span className="sheet__name">
            {listing.make} {listing.model}
            {listing.isOurs && <span className="sheet__you">YOUR CAR</span>}
          </span>
          <span className="sheet__variant">{listing.variant}</span>
          <span className="sheet__rank">
            Ranked #{rank} of {total}
          </span>
        </div>
      </div>

      {listing.dealer && (
        <a
          className="dealer"
          href={`https://${listing.dealer.website}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="dealer__icon">
            <Store width={17} height={17} />
          </span>
          <span className="dealer__info">
            <span className="dealer__name">{listing.dealer.name}</span>
            <span className="dealer__web">{listing.dealer.website}</span>
          </span>
          <ExternalLink width={15} height={15} className="dealer__ext" />
        </a>
      )}

      <div className="mgrid">
        <MetricTile
          k="ETR · marketability"
          v={`${listing.etr}/5`}
          sub={ETR_WORD[listing.etr]}
          tone="accent"
        />
        <MetricTile k="APR · confidence" v={`${listing.apr}%`} sub="in the ETR score" />
        <MetricTile k="Price" v={eur(listing.price)} sub="asking price" />
        <MetricTile k="Purchase gross" v={eur(listing.gross)} sub="buy-in" />
        <MetricTile k="Margin" v={eur(margin)} sub="gross, before costs" />
        <MetricTile k="Mileage" v={fmtKm(listing.mileage)} sub={`${listing.year} · ${listing.daysListed} days listed`} />
      </div>

      {listing.isOurs ? (
        <div className="optgroup">
          <span className="optgroup__h">Specifications</span>
          <ChipList ids={listing.options} kind="shared" />
        </div>
      ) : (
        <>
          <div className="optgroup">
            <span className="optgroup__h optgroup__h--extra">Extra on this car</span>
            <ChipList ids={diff.extra} kind="extra" />
          </div>
          <div className="optgroup">
            <span className="optgroup__h optgroup__h--missing">Missing vs your car</span>
            <ChipList ids={diff.missing} kind="missing" />
          </div>
          <div className="optgroup">
            <span className="optgroup__h">Shared spec</span>
            <ChipList ids={diff.shared} kind="shared" />
          </div>
        </>
      )}

      <button className="btn btn--ghost sheet__close" onClick={onClose}>
        Close
      </button>
    </Sheet>
  )
}

function LegendSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <h2 className="legend__h">How to read this</h2>
      <div className="legend__item">
        <span className="legend__icon">
          <span className="etr etr--4 legend__etr">
            <span className="etr__val">4</span>
            <span className="etr__cap">ETR</span>
          </span>
        </span>
        <div>
          <span className="legend__k">ETR — marketability</span>
          <p className="legend__p">
            How in-demand this car is right now, on a scale of 1–5. Higher means
            hotter in the market and a faster resale after purchase.
          </p>
        </div>
      </div>
      <div className="legend__item">
        <span className="legend__icon">
          <span className="apr__track legend__track">
            <span className="apr__fill" style={{ width: '88%' }} />
          </span>
          <span className="apr__cap">APR 88%</span>
        </span>
        <div>
          <span className="legend__k">APR — confidence</span>
          <p className="legend__p">
            How reliable that ETR estimate is. The fuller the bar, the more
            certain the score.
          </p>
        </div>
      </div>
      <button className="btn btn--ghost sheet__close" onClick={onClose}>
        Got it
      </button>
    </Sheet>
  )
}

/* ── Overlay ────────────────────────────────────────────────────────────── */
export default function Benchmark({
  subject,
  onClose,
}: {
  subject: BenchmarkSubject
  onClose: () => void
}) {
  const { listings, ourRank, total } = useMemo(() => benchmarkFor(subject), [subject])
  const [sheetFor, setSheetFor] = useState<BenchmarkListing | null>(null)
  const [legendOpen, setLegendOpen] = useState(false)

  // While the benchmark is open, the side-by-side comparison shows the current
  // app's comparable-cars screen; restore the previous shot when it closes.
  const { currentShot, setCurrentShot } = useReview()
  const prevShot = useRef(currentShot)
  useEffect(() => {
    const previous = prevShot.current
    setCurrentShot({ src: '/current/benchmark.png', label: 'Current — Comparable cars' })
    return () => setCurrentShot(previous)
  }, [setCurrentShot])

  const ourRowRef = useRef<HTMLButtonElement>(null)

  const scrollToOurs = () =>
    ourRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const ours = subject.options
  const ourEtr = listings.find((l) => l.isOurs)?.etr
  const margin = subject.price - subject.gross
  const markerPct = total > 1 ? ((ourRank - 1) / (total - 1)) * 100 : 0

  return (
    <motion.div
      className="bench"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="bench__top">
        <div className="bench__bar">
          <button className="val__back" onClick={onClose} aria-label="Close benchmark">
            <X width={20} height={20} />
          </button>
          <span className="bench__title">Benchmark</span>
          <button
            className="val__back"
            onClick={() => setLegendOpen(true)}
            aria-label="What do these mean?"
          >
            <Info width={19} height={19} />
          </button>
        </div>
      </header>

      <button className="bench__nav" onClick={scrollToOurs}>
        <div className="bench__nav-top">
          <span className="bench__nav-you">
            <MapPin width={12} height={12} /> Your car
          </span>
          {subject.plate && <span className="bench__nav-plate">{subject.plate}</span>}
          <span className="bench__nav-rank">
            #{ourRank} <span className="bench__nav-of">of {total}</span>
          </span>
        </div>

        <span className="bench__nav-track">
          {listings.map((l, i) => (
            <span
              key={l.id}
              className={`bench__tick ${l.isOurs ? 'is-ours' : ''}`}
              style={{ left: `${total > 1 ? (i / (total - 1)) * 100 : 0}%` }}
            />
          ))}
          <span className="bench__marker" style={{ left: `${markerPct}%` }} />
        </span>
        <span className="bench__nav-ends">
          <span><Flame width={11} height={11} /> Hottest</span>
          <span>Coldest</span>
        </span>

        <span className="bench__nav-stats">
          <span className="bench__nav-stat">
            ETR <b>{ourEtr}</b>
          </span>
          <span className="bench__nav-sep" />
          <span className="bench__nav-stat bench__nav-stat--accent">{eur(margin)} margin</span>
        </span>
      </button>

      <div className="bench__list no-scrollbar">
        {listings.map((l, i) => (
          <BenchRow
            key={l.id}
            listing={l}
            ours={ours}
            rank={i + 1}
            rowRef={l.isOurs ? ourRowRef : undefined}
            onOpen={() => setSheetFor(l)}
          />
        ))}
      </div>

      <AnimatePresence>
        {sheetFor && (
          <BenchmarkSheet
            listing={sheetFor}
            rank={listings.findIndex((l) => l.id === sheetFor.id) + 1}
            total={total}
            ours={ours}
            onClose={() => setSheetFor(null)}
          />
        )}
        {legendOpen && <LegendSheet onClose={() => setLegendOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  )
}
