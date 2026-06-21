'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBookingStore } from '@/lib/store/booking-store'
import { Shield, Sparkles } from 'lucide-react'

export default function RequestedPage() {
  const router = useRouter()
  const { draft, setField, reset } = useBookingStore()
  const supabase = createClient()
  const [submitting, setSubmitting] = useState(false)
  const [showMatch, setShowMatch] = useState(false)

  const partner = draft.suggestedPartner

  useEffect(() => {
    const t = setTimeout(() => setShowMatch(true), 2500)
    return () => clearTimeout(t)
  }, [])

  const handleSecure = async () => {
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
            duration: `${draft.durationHours || 2} hours`,
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

  if (!showMatch) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-teal" />
          </div>
        </div>
        <h1 className="text-lg font-semibold text-foreground mb-3">We have received your request</h1>
        <p className="text-base text-muted-foreground max-w-sm leading-relaxed">
          Our team is reviewing the details and finding the right Anchor for you.
        </p>
        <p className="text-sm text-muted-foreground/40 mt-8">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal/60 animate-pulse" />
            You do not need to do anything right now.
          </span>
        </p>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h1>
        <p className="text-base text-muted-foreground">Please try again.</p>
        <button onClick={() => router.push('/book')} className="mt-6 text-base text-teal font-medium">
          Start again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-xl mx-auto w-full px-6 pt-6 pb-12 flex flex-col">

        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 bg-teal/10 text-teal text-sm font-medium px-4 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4" /> FAMILY VOUCHED
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
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield className="w-4 h-4 text-teal/60" />
              <span className="text-sm text-muted-foreground">FAMILY VOUCHED</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-sm text-muted-foreground">{partner.completedJourneys} journeys</span>
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
          onClick={handleSecure}
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

      </div>
    </div>
  )
}
