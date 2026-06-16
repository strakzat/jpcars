import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DeviceFrame from './components/DeviceFrame'
import GlassTabBar, { type TabId } from './components/GlassTabBar'
import Valuation from './screens/Valuation/Valuation'
import Saved from './screens/Saved/Saved'
import Settings from './screens/Settings/Settings'
import { ReviewProvider, useReview } from './review/ReviewContext'
import ReviewControls from './review/ReviewControls'
import CurrentDesignFrame from './review/CurrentDesignFrame'
import { useMediaQuery } from './review/useMediaQuery'
import { initialSaved, type SavedValuation } from './data/mock'
import './App.css'

function AppShell() {
  const [tab, setTab] = useState<TabId>(
    (typeof window !== 'undefined' &&
      (new URLSearchParams(window.location.search).get('tab') as TabId)) ||
      'valuation',
  )
  const [saved, setSaved] = useState<SavedValuation[]>(initialSaved)
  const [inFlow, setInFlow] = useState(false)
  const { compareOn } = useReview()
  const wide = useMediaQuery('(min-width: 1024px)')

  const addSaved = (v: SavedValuation) => setSaved((list) => [v, ...list])
  const changeTab = (t: TabId) => {
    setInFlow(false)
    setTab(t)
  }

  return (
    <div className="stage">
      {/* Desktop: the current app sits side-by-side in its own column. */}
      {compareOn && wide && (
        <div className="stage__col">
          <span className="stage__cap stage__cap--muted">Current app</span>
          <CurrentDesignFrame />
        </div>
      )}

      <div className="stage__col">
        {compareOn && wide && <span className="stage__cap stage__cap--brand">New design</span>}
        <div className="device-stack">
          <DeviceFrame>
            <div className="app" id="device-app">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  className="app__screen no-scrollbar"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {tab === 'valuation' && (
                    <Valuation
                      recent={saved}
                      onSaved={addSaved}
                      goToSaved={() => changeTab('saved')}
                      onFlowChange={setInFlow}
                    />
                  )}
                  {tab === 'saved' && <Saved items={saved} onNew={() => changeTab('valuation')} />}
                  {tab === 'settings' && <Settings />}
                </motion.div>
              </AnimatePresence>

              <GlassTabBar active={tab} onChange={changeTab} hidden={inFlow} />
            </div>
          </DeviceFrame>

          {/* Mobile/responsive: no room beside the phone, so toggling fades the
              current app over the proposal in the exact same spot. */}
          <AnimatePresence>
            {compareOn && !wide && (
              <motion.div
                key="current"
                className="device-stack__overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <CurrentDesignFrame />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ReviewProvider>
      <AppShell />
      <ReviewControls />
    </ReviewProvider>
  )
}
