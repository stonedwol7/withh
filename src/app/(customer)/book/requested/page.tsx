'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBookingStore } from '@/lib/store/booking-store'
import { Loader2, Shield, Users, Star, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function RequestedPage() {
  const router = useRouter()
  const { draft, setField, reset } = useBookingStore()
  const supabase = createClient()
  const [submitting, setSubmitting] = useState(false)
  const [showMatch, setShowMatch] = useState(false)

  const partner = draft.suggestedPartner

  useEffect(() => {
    const t = setTimeout(() => setShowMatch(true), 2000)
    return () => clearTimeout(t)
  }, [])

  const handleSecure = async () => {
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
            principal_name: 'Myself',
            exact_meeting_spot: draft.location,
            scheduled_at: draft.scheduledAt,
            requires_female_partner: draft.preferredGender === 'female',
            notes: draft.userNeedDescription,
          } as any)

        if (insertError) {
          toast.error(insertError.message)
          setSubmitting(false)
          return
        }

        toast.success('Support confirmed!')
        reset()
        router.push('/journey')
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

  if (!showMatch) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">We&apos;ve received your request</h1>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Our team is reviewing the details and finding the right Support Partner.
        </p>
        <p className="text-xs text-muted-foreground/40 mt-6">You don&apos;t need to do anything right now.</p>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">Please try again.</p>
        <button onClick={() => router.push('/book')} className="mt-6 text-sm text-primary font-medium">
          Start again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full px-5 pt-10 pb-12 flex flex-col">

        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-[10px] font-medium px-3 py-1 rounded-full tracking-wide">
            <Sparkles className="w-3 h-3" /> Your match is ready
          </span>
        </div>

        <div className="bg-card rounded-3xl border border-border overflow-hidden">
          <div className="bg-gradient-to-br from-primary/[0.04] to-accent/[0.04] p-6 text-center border-b border-border">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-3 flex items-center justify-center">
              {partner.avatarUrl ? (
                <img src={partner.avatarUrl} alt={partner.name} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold text-primary">{partner.name.charAt(0)}</span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-foreground">{partner.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{partner.supportLabel || 'Support Partner'}</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="text-xs text-muted-foreground">{partner.completedJourneys} completed journeys</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="flex items-center gap-1 text-xs">
                <Shield className="w-3 h-3 text-primary/60" />
                <span className="text-muted-foreground">Verified</span>
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Languages</p>
              <div className="flex flex-wrap gap-1.5">
                {partner.languages.map((lang) => (
                  <span key={lang} className="text-[10px] bg-muted text-muted-foreground px-2.5 py-1 rounded-full capitalize">{lang}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">About</p>
              <p className="text-sm text-foreground leading-relaxed">{partner.bio}</p>
            </div>

            <div className="bg-primary/[0.04] rounded-2xl p-4">
              <p className="text-[11px] font-medium text-foreground/80 mb-1">Why we chose {partner.name.split(' ')[0]}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
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

        <div className="mt-3 flex items-center justify-center gap-2">
          <Shield className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/40">Verified & background-checked</span>
        </div>

        <button
          onClick={handleSecure}
          disabled={submitting}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 min-h-[52px] mt-6 text-base"
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Securing your match...</>
          ) : (
            <><Users className="w-5 h-5" /> Login via Google to secure {partner.name.split(' ')[0]}</>
          )}
        </button>
        <p className="text-[10px] text-muted-foreground/30 text-center mt-2">Sign in to confirm your Support Partner.</p>

      </div>
    </div>
  )
}
