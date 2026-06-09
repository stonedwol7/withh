'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface ConsentOption {
  id: string
  label: string
  description: string
  required: boolean
}

const defaultConsents: ConsentOption[] = [
  {
    id: 'location',
    label: 'Location Sharing',
    description: 'Allow WITHH to access your location to match you with nearby partners and enable live tracking.',
    required: true,
  },
  {
    id: 'data',
    label: 'Data Processing',
    description: 'Allow us to store and process your personal data for providing accompaniment services.',
    required: true,
  },
  {
    id: 'medical',
    label: 'Medical Information (Optional)',
    description: 'Share relevant medical info with your support partner for better care during hospital visits.',
    required: false,
  },
  {
    id: 'communication',
    label: 'Communication',
    description: 'Receive SMS, email, and push notifications about your journeys.',
    required: false,
  },
  {
    id: 'share-trusted',
    label: 'Share Journey Status',
    description: 'Share your real-time journey status with trusted contacts you set.',
    required: false,
  },
]

interface ConsentFlowProps {
  onComplete: (consents: Record<string, boolean>) => void
  onBack?: () => void
}

export function ConsentFlow({ onComplete, onBack }: ConsentFlowProps) {
  const [consents, setConsents] = useState<Record<string, boolean>>(
    Object.fromEntries(defaultConsents.filter((c) => c.required).map((c) => [c.id, true]))
  )

  const allRequiredAccepted = defaultConsents
    .filter((c) => c.required)
    .every((c) => consents[c.id])

  const toggle = (id: string) => {
    const option = defaultConsents.find((c) => c.id === id)
    if (option?.required && consents[id]) return
    setConsents((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-foreground">Your Consent Matters</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Please review and accept the following to continue
        </p>
      </div>

      {defaultConsents.map((option) => {
        const accepted = consents[option.id]
        return (
          <button
            key={option.id}
            onClick={() => toggle(option.id)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              accepted
                ? 'border-accent/50 bg-accent/5'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  accepted
                    ? 'bg-accent border-accent text-white'
                    : 'border-muted-foreground/30'
                }`}
              >
                {accepted && <Check className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {option.label}
                  {option.required && (
                    <span className="text-destructive text-xs ml-1">*Required</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
              </div>
            </div>
          </button>
        )
      })}

      <div className="pt-4 flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium text-sm"
          >
            Back
          </button>
        )}
        <button
          onClick={() => onComplete(consents)}
          disabled={!allRequiredAccepted}
          className="flex-1 py-3 rounded-xl bg-accent text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Accept & Continue
        </button>
      </div>
    </div>
  )
}
