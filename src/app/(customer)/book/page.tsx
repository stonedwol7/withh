'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBookingStore, HOURLY_RATE } from '@/lib/store/booking-store'
import { parseIntent } from '@/lib/intent-parser'
import { findBestMatch } from '@/lib/partner-matching'
import { ArrowLeft, ArrowRight, Star, Loader2, Clock, MapPin, Users, Heart, Shield, Sparkles, User } from 'lucide-react'
import { toast } from 'sonner'

type BookStep = 'who' | 'describe' | 'when' | 'reveal'

const STEP_LABELS: Record<BookStep, string> = {
  who: 'Who needs support?',
  describe: 'Tell us what you need',
  when: 'When & how long?',
  reveal: 'Your Anchor',
}

export default function BookPage() {
  const router = useRouter()
  const { draft, setField, reset } = useBookingStore()
  const supabase = createClient()

  const [step, setStep] = useState<BookStep>('who')
  const [nameInput, setNameInput] = useState(draft.principalName)
  const [needInput, setNeedInput] = useState(draft.userNeedDescription)
  const [locationInput, setLocationInput] = useState(draft.location)
  const [scheduledAtInput, setScheduledAtInput] = useState(draft.scheduledAt || '')
  const [hours, setHours] = useState(draft.durationHours)
  const [genderPref, setGenderPref] = useState(draft.preferredGender)
  const [matching, setMatching] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
    setField('preferredGender', genderPref)

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
  }, [needInput, genderPref, setField])

  const handleWhenNext = () => {
    if (!scheduledAtInput || !locationInput.trim()) return
    setField('scheduledAt', scheduledAtInput)
    setField('location', locationInput.trim())
    setField('durationHours', hours)
    setField('totalPrice', totalPrice)
    setStep('reveal')
  }

  const handleSecureBooking = async () => {
    setSubmitting(true)

    const cookieValue = encodeURIComponent(JSON.stringify(useBookingStore.getState().draft))
    document.cookie = `withh_pending_booking=${cookieValue}; path=/; max-age=600; SameSite=Lax`

    const { data: auth } = await supabase.auth.getUser()

    if (auth.user) {
      try {
        const { error: insertError } = await supabase
          .from('bookings')
          .insert({
            customer_id: auth.user.id,
            category: 'companionship',
            principal_name: draft.principalName,
            exact_meeting_spot: draft.location,
            scheduled_at: draft.scheduledAt,
            requires_female_partner: draft.preferredGender === 'female',
            duration_estimate_minutes: draft.durationHours * 60,
            total_price: draft.totalPrice,
            notes: draft.userNeedDescription,
          } as any)

        if (insertError) {
          toast.error(insertError.message)
          setSubmitting(false)
          return
        }

        toast.success('Booking confirmed!')
        reset()
        router.push('/dashboard')
      } catch {
        toast.error('Failed to create booking')
        setSubmitting(false)
      }
      return
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })

    if (oauthError) {
      toast.error(oauthError.message)
      setSubmitting(false)
    }
  }

  const goBack = () => {
    const order: BookStep[] = ['who', 'describe', 'when', 'reveal']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
    else router.push('/')
  }

  const stepNumber = ['who', 'describe', 'when', 'reveal'].indexOf(step) + 1

  const partner = draft.suggestedPartner

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-5 h-14 flex items-center gap-3">
        <button onClick={goBack} className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Step {stepNumber} of 4
          </span>
        </div>
        <div className="w-7" />
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-5 pt-8 pb-12">
        {/* Step 1: Who is this for? */}
        {step === 'who' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold text-foreground mb-1 tracking-tight">Who needs support today?</h1>
            <p className="text-sm text-muted-foreground mb-8">We&apos;ll match you with the right Anchor.</p>

            <div className="space-y-4">
              <button
                onClick={() => { setField('forWhom', 'myself'); setNameInput('') }}
                className={`w-full bg-card rounded-2xl border-2 p-5 flex items-center gap-4 text-left transition-all ${
                  draft.forWhom === 'myself' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  draft.forWhom === 'myself' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Myself</p>
                  <p className="text-xs text-muted-foreground mt-0.5">I need support for my own journey</p>
                </div>
                {draft.forWhom === 'myself' && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-auto shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setField('forWhom', 'lovedOne')}
                className={`w-full bg-card rounded-2xl border-2 p-5 flex items-center gap-4 text-left transition-all ${
                  draft.forWhom === 'lovedOne' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  draft.forWhom === 'lovedOne' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">A loved one</p>
                  <p className="text-xs text-muted-foreground mt-0.5">I&apos;m requesting for family or a friend</p>
                </div>
                {draft.forWhom === 'lovedOne' && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-auto shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            </div>

            {draft.forWhom === 'lovedOne' && (
              <div className="mt-6 animate-fade-in">
                <label htmlFor="lovedOneName" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  What is their name?
                </label>
                <input
                  id="lovedOneName"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g., My mother, Ananya"
                  className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[48px]"
                />
              </div>
            )}

            <button
              onClick={handleWhoNext}
              disabled={draft.forWhom === null || (draft.forWhom === 'lovedOne' && !nameInput.trim())}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 min-h-[48px] mt-8"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Describe the need (Open Input) */}
        {step === 'describe' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold text-foreground mb-1 tracking-tight">
              {draft.forWhom === 'lovedOne' ? `Tell us about ${nameInput || 'them'}` : 'What are you facing today?'}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">Describe the situation — we&apos;ll match the right person.</p>

            <textarea
              value={needInput}
              onChange={(e) => setNeedInput(e.target.value)}
              placeholder={`e.g., "I need someone calm to sit with my father at Manipal Hospital for a few hours, he only speaks Kannada."`}
              rows={5}
              className="w-full bg-card border border-input rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[140px]"
            />

            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground mb-3">Preference (optional)</p>
              <div className="flex gap-2">
                {(['any', 'female', 'male'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenderPref(g)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                      genderPref === g
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/20'
                    }`}
                  >
                    {g === 'any' ? 'No preference' : g === 'female' ? 'Prefer a woman' : 'Prefer a man'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDescribeNext}
              disabled={!needInput.trim() || matching}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 min-h-[48px] mt-8"
            >
              {matching ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding your match...</> : 'Find my Anchor'}
            </button>
          </div>
        )}

        {/* Step 3: When, Where & Duration + Pricing */}
        {step === 'when' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-semibold text-foreground mb-1 tracking-tight">When & where?</h1>
            <p className="text-sm text-muted-foreground mb-6">Set the details and choose your duration.</p>

            <div className="space-y-5">
              <div>
                <label htmlFor="book-date" className="text-xs font-medium text-muted-foreground mb-1.5 block">Date & time *</label>
                <input
                  id="book-date"
                  type="datetime-local"
                  value={scheduledAtInput}
                  onChange={(e) => setScheduledAtInput(e.target.value)}
                  className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[48px]"
                />
              </div>

              <div>
                <label htmlFor="book-location" className="text-xs font-medium text-muted-foreground mb-1.5 block">Where should they meet you? *</label>
                <input
                  id="book-location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g., Gate 3, Manipal Hospital, Bangalore"
                  className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[48px]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">How long? <span className="text-muted-foreground/60">({hours} {hours === 1 ? 'hour' : 'hours'})</span></label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-1">
                  <span>1 hr</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8 hrs</span>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">₹{HOURLY_RATE} × {hours} {hours === 1 ? 'hr' : 'hrs'}</span>
                  <span className="text-2xl font-semibold text-foreground">₹{totalPrice}</span>
                </div>
                <p className="text-[10px] text-muted-foreground/40">Flat rate. No hidden fees. Pay only after confirming.</p>
              </div>
            </div>

            <button
              onClick={handleWhenNext}
              disabled={!scheduledAtInput || !locationInput.trim()}
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 min-h-[48px] mt-8"
            >
              Review your Anchor <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 4: Partner Reveal + Auth */}
        {step === 'reveal' && partner && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-[10px] font-medium px-3 py-1 rounded-full tracking-wide">
                <Sparkles className="w-3 h-3" /> Matched for you
              </span>
            </div>

            <div className="bg-card rounded-3xl border border-border overflow-hidden">
              {/* Partner header */}
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-6 text-center border-b border-border">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-3 flex items-center justify-center">
                  {partner.avatarUrl ? (
                    <img src={partner.avatarUrl} alt={partner.name} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-semibold text-primary">{partner.name.charAt(0)}</span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-foreground">{partner.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{partner.supportLabel || 'Companion'}</p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 fill-amber text-amber" />
                    <span className="font-medium text-foreground">{partner.rating}</span>
                    <span className="text-muted-foreground">({partner.ratingCount})</span>
                  </div>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-xs text-muted-foreground">{partner.completedJourneys} journeys</span>
                </div>
              </div>

              {/* Partner details */}
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">About</p>
                  <p className="text-sm text-foreground leading-relaxed">{partner.bio}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {partner.languages.map((lang) => (
                    <span key={lang} className="text-[10px] bg-muted text-muted-foreground px-2.5 py-1 rounded-full capitalize">
                      {lang}
                    </span>
                  ))}
                  {partner.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-accent/10 text-accent px-2.5 py-1 rounded-full capitalize">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">For</span>
                    <span className="text-foreground font-medium">{draft.principalName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">When</span>
                    <span className="text-foreground font-medium">{new Date(draft.scheduledAt!).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Where</span>
                    <span className="text-foreground font-medium text-right max-w-[55%]">{draft.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground font-medium">{hours} {hours === 1 ? 'hour' : 'hours'}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                    <span className="text-foreground font-semibold">Total</span>
                    <span className="text-lg font-semibold text-primary">₹{totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 justify-center">
              <Shield className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/40">Verified & background-checked</span>
            </div>

            <button
              onClick={handleSecureBooking}
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 min-h-[52px] mt-6 text-base"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Securing your Anchor...</>
              ) : (
                <><Users className="w-5 h-5" /> Login via Google to Secure {partner.name.split(' ')[0]}</>
              )}
            </button>
            <p className="text-[10px] text-muted-foreground/30 text-center mt-2">You&apos;ll only need to sign in now. Everything else is saved.</p>
          </div>
        )}
      </div>
    </div>
  )
}
