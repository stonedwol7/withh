'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, MapPin, LogOut, User, ShieldAlert } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'
import { toast } from 'sonner'

type Booking = Database['public']['Tables']['bookings']['Row']

export default function PartnerPage() {
  const router = useRouter()
  const supabase = createClient()
  const [assignments, setAssignments] = useState<Booking[]>([])
  const [partnerName, setPartnerName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const { data: auth } = await supabase.auth.getUser()
        if (!auth.user) {
          router.replace('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', auth.user.id)
          .single()

        if (profile?.role !== 'partner') {
          router.replace('/dashboard')
          return
        }

        // Check KYC status
        const { data: meta } = await supabase
          .from('partners_meta')
          .select('kyc_status')
          .eq('id', auth.user.id)
          .single()

        if (!meta || meta.kyc_status === 'pending' || meta.kyc_status === 'rejected') {
          if (!cancelled) router.replace('/partner/kyc')
          return
        }

        if (!cancelled) setPartnerName(profile?.full_name || 'Partner')

        const { data: myAssignments } = await supabase
          .from('bookings')
          .select('*')
          .eq('partner_id', auth.user.id)
          .order('scheduled_at', { ascending: true })

        if (!cancelled && myAssignments) setAssignments(myAssignments)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [router, supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-copper/30 border-t-copper rounded-full animate-spin" />
      </div>
    )
  }

  const nextMission = assignments.find((a) => a.status !== 'completed' && a.status !== 'cancelled')

  return (
    <div className="min-h-screen bg-alabaster">
      <header className="sticky top-0 bg-alabaster/80 backdrop-blur-xl border-b border-slate/5 px-5 h-14 flex items-center justify-between">
        <h1 className="text-sm font-bold text-slate">WITHH.ME</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{partnerName}</span>
          <button onClick={handleLogout} aria-label="Sign out" className="text-xs text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-6 pb-24">
        <p className="text-xs text-muted-foreground mb-1">Welcome,</p>
        <p className="text-xl font-bold text-slate mb-6">{partnerName}</p>

        {nextMission ? (
          <button
            onClick={() => router.push(`/partner/active-mission/${nextMission.id}`)}
            aria-label={`Active mission: ${nextMission.category}`}
            className="w-full bg-partner-dark text-alabaster rounded-xl p-5 mb-6 text-left hover:opacity-95 transition-all"
          >
            <span className="text-[10px] font-bold text-alabaster/60 uppercase tracking-wider">Active Mission</span>
            <p className="text-lg font-bold text-alabaster mt-1 capitalize">{nextMission.category}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-alabaster/70">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {nextMission.exact_meeting_spot}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {new Date(nextMission.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </button>
        ) : (
          <div className="bg-card rounded-xl border border-slate/5 p-6 text-center mb-6">
            <User className="w-8 h-8 text-slate/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming missions</p>
            <p className="text-xs text-muted-foreground/60 mt-1">New assignments will appear here.</p>
          </div>
        )}

        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 text-center py-8">No assignments yet.</p>
        ) : (
          <div className="space-y-2" role="list" aria-label="Your assignments">
            {assignments.map((b) => (
              <button
                key={b.id}
                onClick={() => router.push(`/partner/active-mission/${b.id}`)}
                aria-label={`View ${b.category} assignment`}
                className="w-full bg-card rounded-xl border border-slate/5 p-4 text-left hover:border-copper/20 transition-all"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-slate capitalize">{b.category}</p>
                  <span className="text-[10px] text-muted-foreground/60">
                    {new Date(b.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{b.exact_meeting_spot}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
