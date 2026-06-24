import { Smartphone, MessageSquareText } from 'lucide-react'
import { useReview } from './ReviewContext'
import './ReviewControls.css'

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`rc-toggle ${on ? 'is-on' : ''}`}
      onClick={() => onChange(!on)}
    >
      <span className="rc-toggle__knob" />
    </button>
  )
}

export default function ReviewControls() {
  const { compareOn, setCompareOn, annotationsOn, setAnnotationsOn } = useReview()

  return (
    <aside className="rc">
      <span className="rc__brand">
        <img className="rc__logo" src="/jpcars-logo.svg" alt="JP.cars" />
        <span className="rc__brand-tag">prototype</span>
      </span>
      <div className="rc__row">
        <span className="rc__icon">
          <MessageSquareText width={18} height={18} />
        </span>
        <span className="rc__text">
          <span className="rc__label">Annotations</span>
          <span className="rc__hint">Notes on the design</span>
        </span>
        <Toggle on={annotationsOn} onChange={setAnnotationsOn} label="Show annotations" />
      </div>
      <div className="rc__row">
        <span className="rc__icon">
          <Smartphone width={18} height={18} />
        </span>
        <span className="rc__text">
          <span className="rc__label">Current app</span>
          <span className="rc__hint">Show the live app side by side</span>
        </span>
        <Toggle on={compareOn} onChange={setCompareOn} label="Show current app" />
      </div>
    </aside>
  )
}
