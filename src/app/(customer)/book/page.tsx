'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBookingStore, type BookingDraft } from '@/lib/store/booking-store'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const categories: { id: BookingDraft['category']; label: string; desc: string; price: number }[] = [
  { id: 'medical', label: 'Medical', desc: 'Hospital visits, check-ups, procedures', price: 899 },
  { id: 'government', label: 'Government', desc: 'BBMP, passport, ration card, etc.', price: 699 },
  { id: 'travel', label: 'Travel', desc: 'Airport, railway station, bus stand', price: 799 },
  { id: 'general', label: 'General', desc: 'Interviews, meetings, social events', price: 699 },
]

export default function BookPage() {
  const router = useRouter()
  const { draft, setField, reset } = useBookingStore()

  const [step, setStep] = useState<'category' | 'details' | 'review'>('category')
  const [location, setLocation] = useState(draft.location)
  const [principalName, setPrincipalName] = useState(draft.principalName)
  const [scheduledAt, setScheduledAt] = useState(draft.scheduledAt || '')
  const [requiresFemale, setRequiresFemale] = useState(draft.requiresFemalePartner)
  const [submitting, setSubmitting] = useState(false)

  const selectedCategory = categories.find((c) => c.id === draft.category)
  const price = selectedCategory?.price || 699

  const handleCategorySelect = (cat: BookingDraft['category']) => {
    setField('category', cat)
    setField('totalPrice', categories.find((c) => c.id === cat)?.price || 699)
    setStep('details')
  }

  const handleDetailsNext = () => {
    if (!location.trim() || !principalName.trim() || !scheduledAt) return
    setField('location', location)
    setField('principalName', principalName)
    setField('scheduledAt', scheduledAt)
    setField('requiresFemalePartner', requiresFemale)
    setStep('review')
  }

  const handleSecureBooking = async () => {
    setSubmitting(true)

    // Persist draft to cookie for server-side callback
    const cookieValue = encodeURIComponent(JSON.stringify(useBookingStore.getState().draft))
    document.cookie = `withh_pending_booking=${cookieValue}; path=/; max-age=600; SameSite=Lax`

    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()

    if (auth.user) {
      try {
        const { error: insertError } = await supabase
          .from('bookings')
          .insert({
            customer_id: auth.user.id,
            category: draft.category!,
            principal_name: principalName,
            exact_meeting_spot: location,
            scheduled_at: scheduledAt,
            requires_female_partner: requiresFemale,
            total_price: price,
          } as any)

        if (insertError) {
          toast.error(insertError.message)
          setSubmitting(false)
          return
        }

        toast.success('Booking confirmed!')
        reset()
        router.push('/dashboard')
      } catch (err) {
        toast.error('Failed to create booking')
        setSubmitting(false)
      }
      return
    }

    // Not authenticated — trigger OAuth, callback handles booking insert
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })

    if (oauthError) {
      toast.error(oauthError.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-alabaster">
      <header className="sticky top-0 bg-alabaster/80 backdrop-blur-xl border-b border-slate/5 px-5 h-14 flex items-center">
        <button onClick={() => step === 'category' ? router.push('/') : setStep('category')} className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {step === 'category' ? 'Step 1 of 3' : step === 'details' ? 'Step 2 of 3' : 'Step 3 of 3'}
          </span>
        </div>
        <div className="w-7" />
      </header>

      <div className="max-w-lg mx-auto px-5 pt-6 pb-8">
        {step === 'category' && (
          <>
            <h1 className="text-xl font-bold text-slate mb-1">What do you need help with?</h1>
            <p className="text-sm text-muted-foreground mb-6">Select the type of support.</p>
            <div className="space-y-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="w-full bg-card rounded-xl border border-slate/5 p-4 flex items-center gap-4 hover:border-copper/20 transition-all text-left"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.desc}</p>
                  </div>
                  <span className="text-sm font-bold text-copper">₹{cat.price}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <h1 className="text-xl font-bold text-slate mb-1">Booking details</h1>
            <p className="text-sm text-muted-foreground mb-6">Tell us more about your request.</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="book-principal" className="text-xs font-medium text-muted-foreground mb-1 block">Full name of person needing support *</label>
                <input
                  id="book-principal"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder="Your name or the person you're requesting for"
                  className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[48px]"
                />
              </div>
              <div>
                <label htmlFor="book-location" className="text-xs font-medium text-muted-foreground mb-1 block">Exact meeting location *</label>
                <input
                  id="book-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Gate 3, BMCRI Hospital"
                  className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[48px]"
                />
              </div>
              <div>
                <label htmlFor="book-datetime" className="text-xs font-medium text-muted-foreground mb-1 block">Date & time *</label>
                <input
                  id="book-datetime"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all min-h-[48px]"
                />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="femalePref"
                  checked={requiresFemale}
                  onChange={(e) => setRequiresFemale(e.target.checked)}
                  className="w-4 h-4 rounded border-slate/20 text-copper focus:ring-copper/20"
                />
                <label htmlFor="femalePref" className="text-sm text-slate">Prefer a female Support Partner</label>
              </div>
              <button
                onClick={handleDetailsNext}
                disabled={!location.trim() || !principalName.trim() || !scheduledAt}
                className="w-full bg-copper text-white py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 min-h-[48px]"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {step === 'review' && (
          <>
            <h1 className="text-xl font-bold text-slate mb-1">Review & confirm</h1>
            <p className="text-sm text-muted-foreground mb-6">Check all details before booking.</p>

            <div className="bg-card rounded-xl border border-slate/5 p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Category</span>
                <span className="text-sm font-medium text-slate capitalize">{draft.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">For</span>
                <span className="text-sm font-medium text-slate">{principalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Location</span>
                <span className="text-sm font-medium text-slate text-right max-w-[60%]">{location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Date & time</span>
                <span className="text-sm font-medium text-slate">{new Date(scheduledAt).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Female partner</span>
                <span className="text-sm font-medium text-slate">{requiresFemale ? 'Yes' : 'No preference'}</span>
              </div>
              <div className="border-t border-slate/5 pt-3 flex justify-between">
                <span className="text-sm font-bold text-slate">Total</span>
                <span className="text-sm font-bold text-copper">₹{price}</span>
              </div>
            </div>

            <button
              onClick={handleSecureBooking}
              disabled={submitting}
              className="w-full bg-copper text-white py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 min-h-[48px]"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Secure Booking'}
            </button>
            <p className="text-[10px] text-muted-foreground/40 text-center mt-3">You&apos;ll be asked to sign in to confirm. Your details are saved.</p>
          </>
        )}
      </div>
    </div>
  )
}
