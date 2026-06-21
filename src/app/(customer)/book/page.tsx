'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBookingStore, HOURLY_RATE } from '@/lib/store/booking-store'
import { parseIntent } from '@/lib/intent-parser'
import { findBestMatch } from '@/lib/partner-matching'
import { ArrowLeft, User, Heart, Shield } from 'lucide-react'

type Step = 'who' | 'describe' | 'when' | 'reveal'

const STEP_LABELS: Record<Step, string> = {
  who: 'Who needs support today?',
  describe: 'Tell us about the situation',
  when: 'When & how long?',
  reveal: 'Your Anchor',
}

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
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/60 px-6 h-16 flex items-center gap-4">
        <button onClick={goBack} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-xs text-muted-foreground font-medium tracking-wide">
            Step {['who', 'describe', 'when', 'reveal'].indexOf(step) + 1} of 4
          </span>
        </div>
        <div className="w-9" />
      </header>

      <div className="flex-1 max-w-xl mx-auto w-full px-6 pt-6 pb-16">

        {/* Step 1: Who is this for? */}
        {step === 'who' && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-semibold text-foreground mb-2">Who needs support today?</h1>
            <p className="text-base text-muted-foreground mb-8">We will match you with the right Anchor.</p>

            <div className="space-y-4">
              <button
                onClick={() => { setField('forWhom', 'myself'); setNameInput('') }}
                className={`w-full bg-card rounded-2xl border-2 p-6 flex items-center gap-5 text-left transition-all ${
                  draft.forWhom === 'myself' ? 'border-teal ring-2 ring-teal/20' : 'border-border/80 hover:border-teal/30'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  draft.forWhom === 'myself' ? 'bg-teal/10 text-teal' : 'bg-muted text-muted-foreground'
                }`}>
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">Booking for Myself</p>
                  <p className="text-sm text-muted-foreground mt-1">I need support for my own journey</p>
                </div>
                {draft.forWhom === 'myself' && (
                  <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center ml-auto shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setField('forWhom', 'lovedOne')}
                className={`w-full bg-card rounded-2xl border-2 p-6 flex items-center gap-5 text-left transition-all ${
                  draft.forWhom === 'lovedOne' ? 'border-teal ring-2 ring-teal/20' : 'border-border/80 hover:border-teal/30'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  draft.forWhom === 'lovedOne' ? 'bg-teal/10 text-teal' : 'bg-muted text-muted-foreground'
                }`}>
                  <Heart className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">Booking for a Loved One</p>
                  <p className="text-sm text-muted-foreground mt-1">I am requesting for family or a friend</p>
                </div>
                {draft.forWhom === 'lovedOne' && (
                  <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center ml-auto shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                )}
              </button>
            </div>

            {draft.forWhom === 'lovedOne' && (
              <div className="mt-6 animate-fade-in">
                <label htmlFor="lovedOneName" className="text-sm font-medium text-muted-foreground mb-2 block">
                  What is their name?
                </label>
                <input
                  id="lovedOneName"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g., My mother, Ananya"
                  className="w-full bg-card border-2 border-border/80 rounded-2xl py-4 px-5 text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all min-h-[56px]"
                />
              </div>
            )}

            <button
              onClick={handleWhoNext}
              disabled={draft.forWhom === null || (draft.forWhom === 'lovedOne' && !nameInput.trim())}
              className="w-full bg-teal text-white py-4 px-8 rounded-2xl font-semibold text-base hover:opacity-90 transition-all disabled:opacity-30 min-h-[56px] mt-8"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Describe the need */}
        {step === 'describe' && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-semibold text-foreground mb-2">Tell us what kind of support is needed today.</h1>
            <p className="text-base text-muted-foreground mb-6">Describe the situation in your own words.</p>

            <textarea
              value={needInput}
              onChange={(e) => setNeedInput(e.target.value)}
              placeholder="I need someone to accompany my mother to a hospital appointment tomorrow. She only speaks Kannada."
              rows={5}
              className="w-full bg-card border-2 border-border/80 rounded-2xl py-4 px-5 text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all resize-none min-h-[160px]"
              autoFocus
            />

            <button
              onClick={handleDescribeNext}
              disabled={!needInput.trim() || matching}
              className="w-full bg-teal text-white py-4 px-8 rounded-2xl font-semibold text-base hover:opacity-90 transition-all disabled:opacity-30 min-h-[56px] mt-8"
            >
              {matching ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                  Finding the right Anchor for you...
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        )}

        {/* Step 3: When & how long */}
        {step === 'when' && (
          <div className="animate-fade-in">
            <h1 className="text-lg font-semibold text-foreground mb-2">When and where?</h1>
            <p className="text-base text-muted-foreground mb-6">Set the details and choose your duration.</p>

            <div className="space-y-5">
              <div>
                <label htmlFor="book-date" className="text-sm font-medium text-muted-foreground mb-2 block">Date</label>
                <input
                  id="book-date"
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-card border-2 border-border/80 rounded-2xl py-4 px-5 text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all min-h-[56px]"
                />
              </div>

              <div>
                <label htmlFor="book-time" className="text-sm font-medium text-muted-foreground mb-2 block">Time</label>
                <input
                  id="book-time"
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  className="w-full bg-card border-2 border-border/80 rounded-2xl py-4 px-5 text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all min-h-[56px]"
                />
              </div>

              <div>
                <label htmlFor="book-location" className="text-sm font-medium text-muted-foreground mb-2 block">Where should they meet you?</label>
                <input
                  id="book-location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g., Gate 3, Manipal Hospital, Bangalore"
                  className="w-full bg-card border-2 border-border/80 rounded-2xl py-4 px-5 text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all min-h-[56px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  How much time? <span className="text-teal font-semibold">{hours} {hours === 1 ? 'hour' : 'hours'}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-3 bg-muted rounded-full appearance-none cursor-pointer accent-teal [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="flex justify-between text-sm text-muted-foreground/60 mt-2">
                  <span>1 hr</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8 hrs</span>
                </div>
              </div>

              <div className="bg-card rounded-2xl border-2 border-teal/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-base text-muted-foreground">
                    <span className="font-semibold text-foreground">₹{HOURLY_RATE}</span> / hr &times; {hours} {hours === 1 ? 'hr' : 'hrs'}
                  </span>
                  <span className="text-2xl font-bold text-foreground">₹{totalPrice}</span>
                </div>
                <p className="text-sm text-muted-foreground/50 mt-1">Flat rate. No hidden fees.</p>
              </div>
            </div>

            <button
              onClick={handleWhenNext}
              disabled={!dateInput || !timeInput || !locationInput.trim()}
              className="w-full bg-teal text-white py-4 px-8 rounded-2xl font-semibold text-base hover:opacity-90 transition-all disabled:opacity-30 min-h-[56px] mt-8"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 4: Partner Reveal */}
        {step === 'reveal' && (
          <div className="animate-fade-in">
            {!partner ? (
              <div className="text-center py-12">
                <span className="inline-flex items-center gap-2 text-base text-teal font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse" />
                  Finding the right Anchor for you...
                </span>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <span className="inline-flex items-center gap-2 bg-teal/10 text-teal text-sm font-medium px-4 py-1.5 rounded-full">
                    <Shield className="w-4 h-4" /> FAMILY VOUCHED
                  </span>
                </div>

                <div className="bg-card rounded-3xl border-2 border-border/80 overflow-hidden">
                  <div className="bg-gradient-to-br from-teal/[0.04] to-navy/[0.04] p-8 text-center border-b border-border/60">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal/20 to-navy/20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                      {partner.avatarUrl ? (
                        <img src={partner.avatarUrl} alt={partner.name} className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-teal">{partner.name.charAt(0)}</span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{partner.name}</h2>
                    <p className="text-base text-muted-foreground mt-1">{partner.supportLabel || 'Support Partner'}</p>
                    <div className="flex items-center justify-center gap-3 mt-3">
                      <span className="text-sm text-muted-foreground">{partner.completedJourneys} completed journeys</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1.5">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {partner.languages.map((lang) => (
                          <span key={lang} className="text-sm bg-muted text-foreground px-3 py-1.5 rounded-xl capitalize">{lang}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1.5">About</p>
                      <p className="text-base text-foreground leading-relaxed">{partner.bio}</p>
                    </div>

                    <div className="bg-teal/[0.04] rounded-2xl p-5 border border-teal/10">
                      <p className="text-sm font-medium text-teal mb-1">Why we chose {partner.name.split(' ')[0]}</p>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {partner.tags.includes('healthcare') || partner.tags.includes('medical')
                          ? 'Experienced with hospital visits and medical appointments.'
                          : partner.tags.includes('government')
                            ? 'Familiar with government office procedures and navigation.'
                            : partner.tags.includes('elderly')
                              ? 'Trained in elderly care and patient accompaniment.'
                              : 'Background and experience match what you described.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-teal/60" />
                  <span className="text-sm text-muted-foreground/60">FAMILY VOUCHED &amp; background-checked</span>
                </div>

                <button
                  onClick={handleSecureBooking}
                  disabled={submitting}
                  className="w-full bg-teal text-white py-5 px-8 rounded-2xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-40 min-h-[60px] mt-6 shadow-lg"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/60 animate-pulse" />
                      Securing your Anchor...
                    </span>
                  ) : (
                    'Secure my Partner'
                  )}
                </button>
                <p className="text-sm text-muted-foreground/40 text-center mt-3">Sign in with Google to confirm your Anchor.</p>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
