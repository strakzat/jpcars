import { createContext, useContext, useState, type ReactNode } from 'react'

export interface CurrentShot {
  /** Path to the current-app screenshot to show in the comparison frame */
  src: string
  /** Short caption describing what this screen maps to */
  label: string
}

interface ReviewState {
  /** Show the current (live) JP.cars app screenshot next to the proposal */
  compareOn: boolean
  setCompareOn: (v: boolean) => void
  /** Show the design annotations overlaid on the proposal */
  annotationsOn: boolean
  setAnnotationsOn: (v: boolean) => void
  /**
   * Which current-app screenshot to show — updated by each screen so the
   * comparison stays in sync with where you are in the new flow.
   */
  currentShot: CurrentShot
  setCurrentShot: (shot: CurrentShot) => void
}

const DEFAULT_SHOT: CurrentShot = {
  src: '/current/plate.png',
  label: 'Current — License plate',
}

const ReviewCtx = createContext<ReviewState | null>(null)

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [compareOn, setCompareOn] = useState(
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('compare'),
  )
  // Annotations are on by default; ?annot=off opens the prototype clean.
  const [annotationsOn, setAnnotationsOn] = useState(
    typeof window === 'undefined' ||
      new URLSearchParams(window.location.search).get('annot') !== 'off',
  )
  const [currentShot, setCurrentShot] = useState<CurrentShot>(DEFAULT_SHOT)

  return (
    <ReviewCtx.Provider
      value={{
        compareOn,
        setCompareOn,
        annotationsOn,
        setAnnotationsOn,
        currentShot,
        setCurrentShot,
      }}
    >
      {children}
    </ReviewCtx.Provider>
  )
}

export function useReview() {
  const ctx = useContext(ReviewCtx)
  if (!ctx) throw new Error('useReview must be used within ReviewProvider')
  return ctx
}
