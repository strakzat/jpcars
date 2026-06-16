import { AnimatePresence, motion } from 'framer-motion'
import { useReview } from './ReviewContext'
import './CurrentDesignFrame.css'

/**
 * The current, live JP.cars app shown as a screenshot inside a matching phone
 * frame — used for side-by-side comparison with the proposal. The screenshot
 * tracks where you are in the new flow (see ReviewContext.currentShot).
 */
export default function CurrentDesignFrame() {
  const { currentShot } = useReview()

  return (
    <div className="device device--shot">
      <div className="device__buttons device__buttons--left" aria-hidden>
        <span className="device__btn device__btn--silent" />
        <span className="device__btn device__btn--vol" />
        <span className="device__btn device__btn--vol" />
      </div>
      <div className="device__buttons device__buttons--right" aria-hidden>
        <span className="device__btn device__btn--power" />
      </div>

      <div className="device__screen">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentShot.src}
            className="cd-shot"
            src={currentShot.src}
            alt={currentShot.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>
        <span className="cd-badge">{currentShot.label}</span>
        <div className="device__home-indicator" aria-hidden />
      </div>
    </div>
  )
}
