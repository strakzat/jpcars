import { Banknote, Bookmark, Settings2 } from 'lucide-react'
import './GlassTabBar.css'

export type TabId = 'valuation' | 'saved' | 'settings'

const tabs: { id: TabId; label: string; Icon: typeof Banknote }[] = [
  { id: 'valuation', label: 'Valuation', Icon: Banknote },
  { id: 'saved', label: 'Saved', Icon: Bookmark },
  { id: 'settings', label: 'Settings', Icon: Settings2 },
]

export default function GlassTabBar({
  active,
  onChange,
  hidden = false,
}: {
  active: TabId
  onChange: (id: TabId) => void
  hidden?: boolean
}) {
  return (
    <nav className={`tabbar ${hidden ? 'is-hidden' : ''}`}>
      <div className="tabbar__glass">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = id === active
          return (
            <button
              key={id}
              className={`tabbar__item ${isActive ? 'is-active' : ''}`}
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon width={22} height={22} strokeWidth={2.2} />
              <span className="tabbar__label">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
