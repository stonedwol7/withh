'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, X } from 'lucide-react'
import Image from 'next/image'

interface TourStep {
  title: string
  description: string
  image?: string
}

const steps: TourStep[] = [
  {
    title: 'Welcome to WITHH',
    description: 'Your trusted companion for important appointments, errands, and events. We match you with verified Support Partners.',
  },
  {
    title: 'Request Support',
    description: 'Tell us what you need — a hospital visit, government office, interview, or any errand. Just 7 simple steps.',
  },
  {
    title: 'Get Matched',
    description: 'Our AI finds the perfect Support Partner based on your preferences, language, and needs.',
  },
  {
    title: 'Stay Safe',
    description: 'Track your journey in real-time, use the SOS button, and share your status with trusted contacts.',
  },
  {
    title: 'Share Feedback',
    description: 'Rate your experience and help us improve. Your feedback makes the community safer for everyone.',
  },
]

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const seen = localStorage.getItem('withh-onboarding-seen')
    if (!seen) setOpen(true)
  }, [])

  const complete = () => {
    localStorage.setItem('withh-onboarding-seen', 'true')
    setOpen(false)
  }

  if (!open) return null

  const s = steps[step]

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-card rounded-3xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex justify-end">
            <button onClick={complete} className="p-1 hover:bg-muted rounded-lg">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🤝</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? 'bg-accent w-6' : 'bg-muted-foreground/20'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-2 rounded-xl bg-muted hover:bg-muted/80"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="p-2 rounded-xl bg-accent text-white hover:bg-accent/90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={complete}
                className="px-6 py-2 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
