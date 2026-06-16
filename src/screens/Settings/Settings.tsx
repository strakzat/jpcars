import { useEffect, useState, type ReactNode } from 'react'
import {
  ChevronRight,
  SlidersHorizontal,
  Percent,
  Bell,
  Globe,
  Moon,
  HelpCircle,
  LogOut,
  Building2,
} from 'lucide-react'
import { useReview } from '../../review/ReviewContext'
import './Settings.css'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`st-toggle ${on ? 'is-on' : ''}`}
      onClick={onToggle}
    >
      <span className="st-toggle__knob" />
    </button>
  )
}

export default function Settings() {
  const { setCurrentShot } = useReview()
  const [dark, setDark] = useState(true)
  const [notify, setNotify] = useState(true)

  useEffect(() => {
    setCurrentShot({ src: '/current/saved.png', label: 'Current app' })
  }, [setCurrentShot])

  return (
    <div className="settings">
      <header className="screen-top">
        <div className="screen-top__bar">
          <h1 className="screen-top__title">Settings</h1>
        </div>
      </header>

      <div className="settings__body">
        <div className="profile">
          <span className="profile__avatar">JD</span>
          <div className="profile__info">
            <span className="profile__name">Jasper de Vries</span>
            <span className="profile__role">
              <Building2 width={13} height={13} /> JP.cars Dealer · Utrecht
            </span>
          </div>
        </div>

        <span className="settings__group-label">Valuation</span>
        <div className="settings__group">
          <Row Icon={SlidersHorizontal} label="Purchase protocol" value="Standard" />
          <Row Icon={Percent} label="Default margin" value="16%" />
          <Row Icon={Globe} label="Region & currency" value="NL · EUR" />
        </div>

        <span className="settings__group-label">App</span>
        <div className="settings__group">
          <Row Icon={Moon} label="Dark mode" control={<Toggle on={dark} onToggle={() => setDark(!dark)} />} />
          <Row
            Icon={Bell}
            label="Notifications"
            control={<Toggle on={notify} onToggle={() => setNotify(!notify)} />}
          />
          <Row Icon={HelpCircle} label="Help & support" />
        </div>

        <button className="settings__signout">
          <LogOut width={17} height={17} /> Sign out
        </button>

        <span className="settings__version">JP.cars · prototype v0.1</span>
      </div>
    </div>
  )
}

function Row({
  Icon,
  label,
  value,
  control,
}: {
  Icon: typeof Bell
  label: string
  value?: string
  control?: ReactNode
}) {
  return (
    <div className="st-row">
      <span className="st-row__icon">
        <Icon width={18} height={18} />
      </span>
      <span className="st-row__label">{label}</span>
      {value && <span className="st-row__value">{value}</span>}
      {control ?? (!value && <ChevronRight width={18} height={18} className="st-row__chev" />)}
      {value && <ChevronRight width={18} height={18} className="st-row__chev" />}
    </div>
  )
}
