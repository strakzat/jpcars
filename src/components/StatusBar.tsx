import './StatusBar.css'

export default function StatusBar() {
  return (
    <div className="statusbar">
      <span className="statusbar__time">9:41</span>
      <div className="statusbar__right">
        <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
          <rect x="0" y="7" width="3" height="5" rx="1" fill="currentColor" />
          <rect x="5" y="4.5" width="3" height="7.5" rx="1" fill="currentColor" />
          <rect x="10" y="2" width="3" height="10" rx="1" fill="currentColor" />
          <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden>
          <path
            d="M8.5 2.5c2.2 0 4.2.8 5.7 2.2l1.3-1.4C13.7 1.4 11.2.4 8.5.4S3.3 1.4 1.5 3.3l1.3 1.4C4.3 3.3 6.3 2.5 8.5 2.5Z"
            fill="currentColor"
          />
          <path
            d="M8.5 6c1.2 0 2.3.5 3.1 1.3l1.3-1.4C11.8 4.7 10.2 4 8.5 4s-3.3.7-4.4 1.9l1.3 1.4C6.2 6.5 7.3 6 8.5 6Z"
            fill="currentColor"
          />
          <circle cx="8.5" cy="10" r="1.6" fill="currentColor" />
        </svg>
        <div className="statusbar__battery" aria-hidden>
          <div className="statusbar__battery-shell">
            <div className="statusbar__battery-fill" />
          </div>
          <div className="statusbar__battery-cap" />
        </div>
      </div>
    </div>
  )
}
