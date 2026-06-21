'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBookingStore } from '@/lib/store/booking-store'
import { parseIntent } from '@/lib/intent-parser'
import { findBestMatch } from '@/lib/partner-matching'
import { ArrowLeft, Loader2 } from 'lucide-react'

type Step = 'describe' | 'when' | 'preferences'

export default function BookPage() {
  const router = useRouter()
  const { draft, setField, reset } = useBookingStore()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('describe')
  const [needInput, setNeedInput] = useState(draft.userNeedDescription)
  const [dateInput, setDateInput] = useState(draft.scheduledAt?.split('T')[0] || '')
  const [timeInput, setTimeInput] = useState(draft.scheduledAt?.split('T')[1]?.slice(0, 5) || '')
  const [locationInput, setLocationInput] = useState(draft.location)
  const [genderPref, setGenderPref] = useState(draft.preferredGender)
  const [languageInput, setLanguageInput] = useState(draft.language)
  const [trustedInput, setTrustedInput] = useState(draft.trustedContact)
  const [submitting, setSubmitting] = useState(false)

  const canNextDescribe = needInput.trim().length > 0
  const canNextWhen = dateInput && timeInput && locationInput.trim()
  const canSubmit = true

  const handleDescribeNext = () => {
    if (!canNextDescribe) return
    setField('userNeedDescription', needInput.trim())
    setStep('when')
  }

  const handleWhenNext = () => {
    if (!canNextWhen) return
    setField('scheduledAt', `${dateInput}T${timeInput}:00`)
    setField('location', locationInput.trim())
    setStep('preferences')
  }

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setSubmitting(true)

    setField('preferredGender', genderPref)
    setField('language', languageInput.trim())
    setField('trustedContact', trustedInput.trim())

    try {
      const intent = parseIntent(needInput)
      const partner = await findBestMatch(intent, '')
      setField('suggestedPartner', partner)
    } catch {
      const intent = parseIntent(needInput)
      const { findBestMatch: fallbackMatch } = await import('@/lib/partner-matching')
      const partner = await fallbackMatch(intent, '')
      setField('suggestedPartner', partner)
    }

    const cookieValue = encodeURIComponent(JSON.stringify(useBookingStore.getState().draft))
    document.cookie = `withh_pending_booking=${cookieValue}; path=/; max-age=600; SameSite=Lax`

    setSubmitting(false)
    router.push('/book/requested')
  }, [needInput, genderPref, languageInput, trustedInput, setField, router])

  const goBack = () => {
    if (step === 'describe') router.push('/')
    else if (step === 'when') setStep('describe')
    else setStep('when')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-5 h-14 flex items-center gap-3">
        <button onClick={goBack} className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Step {step === 'describe' ? 1 : step === 'when' ? 2 : 3} of 3
          </span>
        </div>
        <div className="w-7" />
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-5 pt-8 pb-12">

        {step === 'describe' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold text-foreground mb-1 tracking-tight">Tell us what you need</h1>
            <p className="text-sm text-muted-foreground mb-6">Describe the situation — we&apos;ll figure out the rest.</p>

            <textarea
              value={needInput}
              onChange={(e) => setNeedInput(e.target.value)}
              placeholder="I need someone to accompany my mother to a hospital appointment tomorrow."
              rows={6}
              className="w-full bg-card border border-input rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[160px]"
              autoFocus
            />

            <button
              onClick={handleDescribeNext}
              disabled={!canNextDescribe}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-30 min-h-[48px] mt-8"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'when' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold text-foreground mb-1 tracking-tight">When and where?</h1>
            <p className="text-sm text-muted-foreground mb-6">Let us know the details so we can find the right person.</p>

            <div className="space-y-5">
              <div>
                <label htmlFor="book-date" className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
                <input
                  id="book-date"
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[48px]"
                />
              </div>

              <div>
                <label htmlFor="book-time" className="text-xs font-medium text-muted-foreground mb-1.5 block">Time</label>
                <input
                  id="book-time"
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[48px]"
                />
              </div>

              <div>
                <label htmlFor="book-location" className="text-xs font-medium text-muted-foreground mb-1.5 block">Location</label>
                <input
                  id="book-location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g., Gate 3, Manipal Hospital, Bangalore"
                  className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[48px]"
                />
              </div>
            </div>

            <button
              onClick={handleWhenNext}
              disabled={!canNextWhen}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-30 min-h-[48px] mt-8"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'preferences' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold text-foreground mb-1 tracking-tight">Almost done</h1>
            <p className="text-sm text-muted-foreground mb-6">A few preferences to help us find the best match.</p>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3">Partner preference</p>
                <div className="flex gap-2">
                  {(['any', 'female', 'male'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenderPref(g)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border ${
                        genderPref === g
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-card text-muted-foreground border-border hover:border-primary/20'
                      }`}
                    >
                      {g === 'any' ? 'No preference' : g === 'female' ? 'Female' : 'Male'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="book-language" className="text-xs font-medium text-muted-foreground mb-1.5 block">Language preference (optional)</label>
                <input
                  id="book-language"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  placeholder="e.g., Kannada, Hindi, English"
                  className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[48px]"
                />
              </div>

              <div>
                <label htmlFor="book-trusted" className="text-xs font-medium text-muted-foreground mb-1.5 block">Trusted contact (optional)</label>
                <input
                  id="book-trusted"
                  value={trustedInput}
                  onChange={(e) => setTrustedInput(e.target.value)}
                  placeholder="Their phone number or name"
                  className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[48px]"
                />
                <p className="text-[10px] text-muted-foreground/50 mt-1.5">We&apos;ll notify them once your partner is confirmed.</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 min-h-[48px] mt-8"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Request'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
