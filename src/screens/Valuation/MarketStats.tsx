import { Flame } from 'lucide-react'
import './MarketStats.css'

const ETR_WORD: Record<number, string> = {
  5: 'Very hot',
  4: 'Hot',
  3: 'Average',
  2: 'Slow',
  1: 'Cold',
}

/**
 * Two market-signal stats — ETR (marketability) and APR (confidence) — shown on
 * the valuation result and detail screens. Values come from the same benchmark
 * model used by the comparable-cars view, so they stay in sync.
 */
export default function MarketStats({ etr, apr }: { etr: number; apr: number }) {
  return (
    <div className="mstats">
      <div className="mstat">
        <span className="mstat__k">
          <Flame width={12} height={12} /> ETR · marketability
        </span>
        <span className="mstat__v">
          {etr}
          <span className="mstat__unit">/5</span>
        </span>
        <span className="mstat__sub">{ETR_WORD[etr]}</span>
      </div>
      <div className="mstat">
        <span className="mstat__k">APR · confidence</span>
        <span className="mstat__v">
          {apr}
          <span className="mstat__unit">%</span>
        </span>
        <span className="mstat__bar">
          <span className="mstat__fill" style={{ width: `${apr}%` }} />
        </span>
      </div>
    </div>
  )
}
