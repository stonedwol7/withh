'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface AccessibilityState {
  largeText: boolean
  highContrast: boolean
  reducedMotion: boolean
  screenReaderOptimized: boolean
  toggleLargeText: () => void
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
}

const AccessibilityContext = createContext<AccessibilityState | null>(null)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('withh-accessibility')
    if (saved) {
      const prefs = JSON.parse(saved)
      setLargeText(prefs.largeText || false)
      setHighContrast(prefs.highContrast || false)
      setReducedMotion(prefs.reducedMotion || false)
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) setReducedMotion(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('text-lg', largeText)
    document.documentElement.classList.toggle('high-contrast', highContrast)
    document.documentElement.classList.toggle('reduce-motion', reducedMotion)
    localStorage.setItem('withh-accessibility', JSON.stringify({ largeText, highContrast, reducedMotion }))
  }, [largeText, highContrast, reducedMotion])

  return (
    <AccessibilityContext.Provider
      value={{
        largeText, highContrast, reducedMotion, screenReaderOptimized,
        toggleLargeText: () => setLargeText((p) => !p),
        toggleHighContrast: () => setHighContrast((p) => !p),
        toggleReducedMotion: () => setReducedMotion((p) => !p),
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider')
  return ctx
}
