import type { ReactNode } from 'react'
import StatusBar from './StatusBar'
import './DeviceFrame.css'

export default function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="device">
      <div className="device__buttons device__buttons--left" aria-hidden>
        <span className="device__btn device__btn--silent" />
        <span className="device__btn device__btn--vol" />
        <span className="device__btn device__btn--vol" />
      </div>
      <div className="device__buttons device__buttons--right" aria-hidden>
        <span className="device__btn device__btn--power" />
      </div>

      <div className="device__screen">
        <StatusBar />
        <div className="device__content">{children}</div>
        <div className="device__home-indicator" aria-hidden />
      </div>
    </div>
  )
}
