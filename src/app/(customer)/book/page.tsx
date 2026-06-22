'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBookingStore, HOURLY_RATE } from '@/lib/store/booking-store'
import { parseIntent } from '@/lib/intent-parser'
import { findBestMatch } from '@/lib/partner-matching'
import { ArrowLeft, User, Heart } from 'lucide-react'

type Step = 'who' | 'describe' | 'when' | 'reveal'

export default function BookPage() {
  const router = useRouter()
  const { draft, setField, reset } = useBookingStore()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('who')
  const [nameInput, setNameInput] = useState(draft.principalName)
  const [needInput, setNeedInput] = useState(draft.userNeedDescription)
  const [dateInput, setDateInput] = useState(draft.scheduledAt?.split('T')[0] || '')
  const [timeInput, setTimeInput] = useState(draft.scheduledAt?.split('T')[1]?.slice(0, 5) || '')
  const [locationInput, setLocationInput] = useState(draft.location)
  const [hours, setHours] = useState(draft.durationHours)
  const [matching, setMatching] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const partner = draft.suggestedPartner
  const totalPrice = HOURLY_RATE * hours

  const handleWhoNext = () => {
    if (draft.forWhom === 'lovedOne' && !nameInput.trim()) return
    if (draft.forWhom === 'myself') setField('principalName', 'Myself')
    else setField('principalName', nameInput.trim())
    setStep('describe')
  }

  const handleDescribeNext = useCallback(async () => {
    if (!needInput.trim()) return
    setField('userNeedDescription', needInput.trim())
    setMatching(true)
    try {
      const intent = parseIntent(needInput)
      const partner = await findBestMatch(intent, '')
      setField('suggestedPartner', partner)
    } catch {
      const intent = parseIntent(needInput)
      const { findBestMatch: fallbackMatch } = await import('@/lib/partner-matching')
      const partner = await fallbackMatch(intent, '')
      setField('suggestedPartner', partner)
    } finally {
      setMatching(false)
      setStep('when')
    }
  }, [needInput, setField])

  const handleWhenNext = () => {
    if (!dateInput || !timeInput || !locationInput.trim()) return
    setField('scheduledAt', `${dateInput}T${timeInput}:00`)
    setField('location', locationInput.trim())
    setField('durationHours', hours)
    setStep('reveal')
  }

  const handleSecureBooking = async () => {
    setSubmitting(true)

    const cookieValue = encodeURIComponent(JSON.stringify(useBookingStore.getState().draft))
    document.cookie = `withh_pending_booking=${cookieValue}; path=/; max-age=600; SameSite=Lax`

    const { data: auth } = await supabase.auth.getUser()

    if (auth.user) {
      try {
        let date = null as string | null
        let time = null as string | null
        if (draft.scheduledAt) {
          const parts = draft.scheduledAt.split('T')
          date = parts[0]
          time = parts[1]?.slice(0, 5)
        }

        const { error: insertError } = await supabase
          .from('requests')
          .insert({
            customer_id: auth.user.id,
            category: 'companionship',
            principal_name: draft.principalName || 'Myself',
            description: draft.userNeedDescription || null,
            meeting_location: draft.location || '',
            date,
            time,
            duration: `${hours} hours`,
          } as any)

        if (insertError) {
          alert('Something went wrong. Please try again.')
          setSubmitting(false)
          return
        }

        reset()
        router.push('/journey')
      } catch {
        alert('Something went wrong. Please try again.')
        setSubmitting(false)
      }
      return
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })

    if (oauthError) {
      alert('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const goBack = () => {
    const order: Step[] = ['who', 'describe', 'when', 'reveal']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
    else router.push('/')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 h-12 flex items-center gap-3">
        <button onClick={goBack} className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4 text-foreground/60" />
        </button>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground/50 font-medium">
          Step {['who', 'describe', 'when', 'reveal'].indexOf(step) + 1} of 4
        </span>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-6 pb-12">

        {step === 'who' && (
          <div>
            <h1 className="text-lg font-semibold text-foreground mb-1">Who needs support today?</h1>
            <p className="text-sm text-muted-foreground mb-6">We will match you with the right person.</p>

            <div className="space-y-3">
              <button
                onClick={() => { setField('forWhom', 'myself'); setNameInput('') }}
                className={`w-full bg-card rounded-xl border p-4 flex items-center gap-4 text-left transition-all ${
                  draft.forWhom === 'myself' ? 'border-foreground ring-1 ring-foreground/10' : 'border-border/70 hover:border-foreground/20'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  draft.forWhom === 'myself' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Booking for Myself</p>
                  <p className="text-xs text-muted-foreground mt-0.5">I need support for my own journey</p>
                </div>
                {draft.forWhom === 'myself' && (
                  <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-background" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setField('forWhom', 'lovedOne')}
                className={`w-full bg-card rounded-xl border p-4 flex items-center gap-4 text-left transition-all ${
                  draft.forWhom === 'lovedOne' ? 'border-foreground ring-1 ring-foreground/10' : 'border-border/70 hover:border-foreground/20'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  draft.forWhom === 'lovedOne' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                }`}>
                  <Heart className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Booking for a Loved One</p>
                  <p className="text-xs text-muted-foreground mt-0.5">I am requesting for family or a friend</p>
                </div>
                {draft.forWhom === 'lovedOne' && (
                  <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-background" />
                  </div>
                )}
              </button>
            </div>

            {draft.forWhom === 'lovedOne' && (
              <div className="mt-4">
                <label htmlFor="lovedOneName" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  What is their name?
                </label>
                <input
                  id="lovedOneName"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g., My mother, Ananya"
                  className="w-full bg-card border border-border/70 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/10 transition-all"
                />
              </div>
            )}

            <button
              onClick={handleWhoNext}
              disabled={draft.forWhom === null || (draft.forWhom === 'lovedOne' && !nameInput.trim())}
              className="w-full bg-foreground text-background py-3.5 px-6 rounded-xl font-medium text-sm hover:bg-foreground/90 transition-all disabled:opacity-25 mt-6 active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'describe' && (
          <div>
            <h1 className="text-lg font-semibold text-foreground mb-1">Tell us about the situation</h1>
            <p className="text-sm text-muted-foreground mb-5">Describe what kind of support is needed today.</p>

            <textarea
              value={needInput}
              onChange={(e) => setNeedInput(e.target.value)}
              placeholder="I need someone to accompany my mother to a hospital appointment tomorrow. She only speaks Kannada."
              rows={5}
              className="w-full bg-card border border-border/70 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/10 transition-all resize-none"
              autoFocus
            />

            <button
              onClick={handleDescribeNext}
              disabled={!needInput.trim() || matching}
              className="w-full bg-foreground text-background py-3.5 px-6 rounded-xl font-medium text-sm hover:bg-foreground/90 transition-all disabled:opacity-25 mt-5 active:scale-[0.98]"
            >
              {matching ? 'Finding the right person...' : 'Continue'}
            </button>
          </div>
        )}

        {step === 'when' && (
          <div>
            <h1 className="text-lg font-semibold text-foreground mb-1">When and where?</h1>
            <p className="text-sm text-muted-foreground mb-5">Set the details and choose how long you need support.</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="book-date" className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
                <input
                  id="book-date"
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-card border border-border/70 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/10 transition-all"
                />
              </div>

              <div>
                <label htmlFor="book-time" className="text-xs font-medium text-muted-foreground mb-1.5 block">Time</label>
                <input
                  id="book-time"
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  className="w-full bg-card border border-border/70 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/10 transition-all"
                />
              </div>

              <div>
                <label htmlFor="book-location" className="text-xs font-medium text-muted-foreground mb-1.5 block">Where should they meet you?</label>
                <input
                  id="book-location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g., Gate 3, Manipal Hospital, Bangalore"
                  className="w-full bg-card border border-border/70 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/10 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  How much time? <span className="text-foreground font-semibold">{hours} {hours === 1 ? 'hour' : 'hours'}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-foreground [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-md"
                />
                <div className="flex justify-between text-xs text-muted-foreground/40 mt-1">
                  <span>1 hr</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8 hrs</span>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">₹{HOURLY_RATE}</span> / hr &times; {hours} {hours === 1 ? 'hr' : 'hrs'}
                  </span>
                  <span className="text-xl font-semibold text-foreground">₹{totalPrice}</span>
                </div>
                <p className="text-xs text-muted-foreground/50 mt-0.5">Flat rate. No hidden fees.</p>
              </div>
            </div>

            <button
              onClick={handleWhenNext}
              disabled={!dateInput || !timeInput || !locationInput.trim()}
              className="w-full bg-foreground text-background py-3.5 px-6 rounded-xl font-medium text-sm hover:bg-foreground/90 transition-all disabled:opacity-25 mt-5 active:scale-[0.98]"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'reveal' && (
          <div>
            {!partner ? (
              <div className="text-center py-16">
                <p className="text-sm text-muted-foreground">Finding the right person...</p>
              </div>
            ) : (
              <>
                <div className="bg-card rounded-2xl border border-border/70 overflow-hidden">
                  <div className="bg-muted/50 p-6 text-center border-b border-border/50">
                    <div className="w-20 h-20 rounded-full bg-foreground/5 mx-auto mb-3 flex items-center justify-center">
                      {partner.avatarUrl ? (
                        <img src={partner.avatarUrl} alt={partner.name} className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold text-foreground/30">{partner.name.charAt(0)}</span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">{partner.name}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{partner.supportLabel || 'Support Partner'}</p>
                    <p className="text-xs text-muted-foreground/50 mt-2">{partner.completedJourneys} completed journeys</p>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Languages</p>
                      <div className="flex flex-wrap gap-1.5">
                        {partner.languages.map((lang) => (
                          <span key={lang} className="text-xs bg-muted text-foreground/70 px-2.5 py-1 rounded-lg capitalize">{lang}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">About</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{partner.bio}</p>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4">
                      <p className="text-xs font-medium text-foreground/60 mb-0.5">Why we chose {partner.name.split(' ')[0]}</p>
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        {partner.tags.includes('healthcare') || partner.tags.includes('medical')
                          ? 'Experienced with hospital visits and medical appointments.'
                          : partner.tags.includes('government')
                            ? 'Familiar with government office procedures and navigation.'
                            : partner.tags.includes('elderly')
                              ? 'Trained in elderly care and patient accompaniment.'
                              : 'Background and experience match what you described.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 justify-center pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                      <span className="text-xs text-muted-foreground/50">Verified & background-checked</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSecureBooking}
                  disabled={submitting}
                  className="w-full bg-foreground text-background py-4 px-6 rounded-xl font-semibold text-sm hover:bg-foreground/90 transition-all disabled:opacity-25 mt-5 active:scale-[0.98]"
                >
                  {submitting ? 'Preparing your request...' : 'Confirm Request'}
                </button>
                <p className="text-xs text-muted-foreground/40 text-center mt-3">You will sign in with Google to confirm.</p>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
