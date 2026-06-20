'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Calendar, Clock, MapPin, LogOut, Plus } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'
import { toast } from 'sonner'

type Booking = Database['public']['Tables']['bookings']['Row']

export default function DashboardPage() {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient>>()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = supabaseRef.current ?? (supabaseRef.current = createClient())
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

        if (profile?.role === 'partner') {
          router.replace('/partner')
          return
        }

        if (!cancelled) setUserName(profile?.full_name || auth.user.email?.split('@')[0] || 'You')

        const { data: userBookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_id', auth.user.id)
          .order('created_at', { ascending: false })

        if (!cancelled && userBookings) setBookings(userBookings)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load dashboard')
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

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber/10 text-amber',
      confirmed: 'bg-copper/10 text-copper',
      partner_assigned: 'bg-blue/10 text-blue',
      in_progress: 'bg-green/10 text-green',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive',
    }
    return colors[status] || 'bg-muted text-muted-foreground'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-copper/30 border-t-copper rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-alabaster">
      <header className="sticky top-0 bg-alabaster/80 backdrop-blur-xl border-b border-slate/5 px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-slate">WITHH.ME</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{userName}</span>
          <button onClick={handleLogout} aria-label="Sign out" className="text-xs text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <p className="text-xl font-bold text-slate">{userName}</p>
          </div>
          <button
            onClick={() => router.push('/book')}
            aria-label="New booking"
            className="bg-copper text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all flex items-center gap-1.5 min-h-[40px]"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-10 h-10 text-slate/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No bookings yet</p>
            <p className="text-xs text-muted-foreground/60 mb-6">Request your first Support Partner.</p>
            <button
              onClick={() => router.push('/book')}
              className="bg-copper text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              Request Support <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Your bookings">
            {bookings.map((b) => (
              <div key={b.id} className="bg-card rounded-xl border border-slate/5 p-4" role="listitem">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-slate capitalize">
                    {b.category.replace(/_/g, ' ')}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(b.status)}`} aria-label={`Status: ${b.status.replace(/_/g, ' ')}`}>
                    {b.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{b.exact_meeting_spot}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>{new Date(b.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{b.duration_estimate_minutes} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
