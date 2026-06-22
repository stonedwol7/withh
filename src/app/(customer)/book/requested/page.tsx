'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useBookingStore } from '@/lib/store/booking-store'
import { Shield } from 'lucide-react'

export default function RequestedPage() {
  const router = useRouter()
  const { draft, reset } = useBookingStore()
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
        <h1 className="text-lg font-semibold text-foreground mb-2">Request received</h1>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          Our team is reviewing the details and finding the right person for you.
        </p>
        <p className="text-xs text-muted-foreground/50 mt-6">
          You do not need to do anything right now.
        </p>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">Please try again.</p>
        <button onClick={() => router.push('/book')} className="mt-5 text-sm text-foreground font-medium">
          Start again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-6 pb-12 flex flex-col">

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
              <Shield className="w-3 h-3 text-foreground/20" />
              <span className="text-xs text-muted-foreground/50">Verified & background-checked</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSecure}
          disabled={submitting}
          className="w-full bg-foreground text-background py-4 px-6 rounded-xl font-semibold text-sm hover:bg-foreground/90 transition-all disabled:opacity-25 mt-5 active:scale-[0.98]"
        >
          {submitting ? 'Confirming...' : 'Confirm Request'}
        </button>
        <p className="text-xs text-muted-foreground/40 text-center mt-3">Sign in with Google to confirm.</p>

      </div>
    </div>
  )
}
