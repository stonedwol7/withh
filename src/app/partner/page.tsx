'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock, MapPin, LogOut, User, Hourglass } from 'lucide-react'
import { toast } from 'sonner'

export default function PartnerPage() {
  const router = useRouter()
  const getSupabase = useRef(() => createClient()).current
  const [missions, setMissions] = useState<any[]>([])
  const [partnerName, setPartnerName] = useState('')
  const [partnerStatus, setPartnerStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { data: auth } = await getSupabase().auth.getUser()
        if (!auth.user) { router.replace('/login'); return }

        const { data: partners } = await (getSupabase() as any)
          .from('support_partners')
          .select('*')
          .eq('auth_id', auth.user.id)
          .limit(1)

        const partner = ((partners || [])[0] as any)

        if (!partner) {
          toast.error('Partner profile not found')
          router.replace('/dashboard')
          return
        }

        if (partner.verification_status === 'rejected') {
          if (!cancelled) router.replace('/partner/kyc')
          return
        }

        if (!cancelled) {
          setPartnerName(partner.name || 'Partner')
          setPartnerStatus(partner.verification_status || '')
        }

        const { data: assignments } = await (getSupabase() as any)
          .from('assignments')
          .select('*, requests(*)')
          .eq('partner_id', partner.id)
          .order('created_at', { ascending: false })

        if (!cancelled && assignments) setMissions(assignments as any[])
      } catch {
        toast.error('Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [router, getSupabase])

  const handleLogout = async () => {
    try {
      await getSupabase().auth.signOut()
      router.push('/')
    } catch {
      toast.error('Failed to sign out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  const nextMission = missions.find((a) => a.status !== 'completed' && a.status !== 'cancelled')
  const request = nextMission?.requests

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border px-5 h-14 flex items-center justify-between">
        <h1 className="text-sm font-bold text-foreground">WITHH.ME</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{partnerName}</span>
          <button onClick={handleLogout} aria-label="Sign out" className="text-xs text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-6 pb-24">
        {partnerStatus === 'pending' ? (
          <div className="text-center py-12">
            <Hourglass className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Profile under review</p>
            <p className="text-xs text-muted-foreground/60">Your profile has been submitted for verification. You will be notified once approved.</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Welcome,</p>
            <p className="text-xl font-bold text-foreground mb-6">{partnerName}</p>

            {nextMission && request ? (
              <button
                onClick={() => router.push(`/partner/active-mission/${request.id}`)}
                className="w-full bg-foreground text-background rounded-xl p-5 mb-6 text-left hover:opacity-95 transition-all"
              >
                <span className="text-[10px] font-bold text-background/60 uppercase tracking-wider">Active Mission</span>
                <p className="text-lg font-bold text-background mt-1 capitalize">{request.category || 'Mission'}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-background/70">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {request.meeting_location || request.destination || 'Location TBD'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {request.time ? request.time.slice(0, 5) : request.date || 'Time TBD'}
                  </div>
                </div>
              </button>
            ) : (
              <div className="bg-card rounded-xl border border-border p-6 text-center mb-6">
                <User className="w-8 h-8 text-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming missions</p>
                <p className="text-xs text-muted-foreground/60 mt-1">New assignments will appear here.</p>
              </div>
            )}

            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All assignments</h2>
            {missions.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 text-center py-8">No assignments yet.</p>
            ) : (
              <div className="space-y-2">
                {missions.map((a: any) => {
                  const req = a.requests
                  return (
                    <button
                      key={a.id}
                      onClick={() => router.push(`/partner/active-mission/${req?.id || a.request_id}`)}
                      className="w-full bg-card rounded-xl border border-border p-4 text-left hover:border-foreground/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-semibold text-foreground capitalize">{req?.category || 'Mission'}</p>
                        <span className="text-[10px] text-muted-foreground/60 capitalize">{a.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{req?.meeting_location || req?.description?.slice(0, 40) || ''}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
