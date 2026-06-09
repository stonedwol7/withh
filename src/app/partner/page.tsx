'use client'

import { PartnerHeader } from '@/components/shared/partner-nav'
import { SectionHeader } from '@/components/shared/section-header'
import { EmptyState } from '@/components/shared/empty-state'
import { CardSkeleton } from '@/components/shared/skeleton'
import { useAppStore } from '@/store/use-store'
import { useAuthStore } from '@/store/auth-store'
import { useState, useMemo, useEffect } from 'react'
import { format } from 'date-fns'
import { Calendar, Star, Users, TrendingUp } from 'lucide-react'

export default function PartnerHome() {
  const [available, setAvailable] = useState(true)
  const [mounted, setMounted] = useState(false)
  const requests = useAppStore((s) => s.supportRequests)
  const allEarnings = useAppStore((s) => s.partnerEarnings)
  const userName = useAuthStore((s) => s.userName)
  const partners = useAppStore((s) => s.supportPartners)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const partner = useMemo(
    () => partners.find((p) => userName.includes(p.name.split(' ')[0])) || partners[0],
    [userName, partners]
  )

  const partnerId = partner?.id || 'partner-2'

  const earnings = useMemo(
    () => allEarnings.filter((e) => e.partnerId === partnerId),
    [allEarnings, partnerId]
  )

  const todayStr = new Date().toISOString().split('T')[0]
  const partnerRequests = useMemo(
    () => requests.filter((r) => r.assignedPartnerId === partnerId),
    [requests, partnerId]
  )

  const todayAssignments = useMemo(
    () => partnerRequests.filter((r) => r.date === todayStr),
    [partnerRequests]
  )
  const upcoming = useMemo(
    () => partnerRequests.filter((r) => r.date !== todayStr),
    [partnerRequests]
  )

  if (!mounted) {
    return (
      <div>
        <PartnerHeader showBack={false} />
        <div className="px-5 pt-6 pb-6 space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PartnerHeader showBack={false} />

      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <p className="text-xl font-bold text-foreground">{partner?.name || 'Partner'}</p>
          </div>
          <button
            onClick={() => setAvailable(!available)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all btn-press ${
              available
                ? 'bg-green text-white shadow-sm shadow-green/20'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {available ? 'Available' : 'Unavailable'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up stagger-1">
          <div className="bg-card rounded-xl border border-border p-4 card-hover">
            <Star className="w-5 h-5 text-amber mb-2" />
            <p className="text-xl font-bold text-foreground">{partner?.rating || '4.9'}</p>
            <p className="text-[10px] text-muted-foreground">Rating</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 card-hover">
            <Users className="w-5 h-5 text-accent mb-2" />
            <p className="text-xl font-bold text-foreground">{partner?.completedJourneys || 0}</p>
            <p className="text-[10px] text-muted-foreground">Journeys</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 card-hover">
            <TrendingUp className="w-5 h-5 text-green mb-2" />
            <p className="text-xl font-bold text-foreground">
              ₹{earnings.reduce((sum, e) => sum + (e.status === 'paid' ? e.amount : 0), 0)}
            </p>
            <p className="text-[10px] text-muted-foreground">Earned</p>
          </div>
        </div>

        {todayAssignments.length > 0 && (
          <div className="mb-6 animate-fade-in-up stagger-2">
            <SectionHeader title="Today" />
            {todayAssignments.map((req) => (
              <div key={req.id} className="bg-card rounded-2xl border border-border p-5 mb-3 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${
                    req.status === 'completed' ? 'bg-green/10 text-green' : 'bg-accent/10 text-accent'
                  }`}>
                    {req.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </span>
                  <span className="text-base font-bold text-foreground">{req.time}</span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{req.destination}</p>
                <p className="text-xs text-muted-foreground mb-1">📍 {req.meetingLocation}</p>
                <p className="text-xs text-muted-foreground/60">👤 Customer</p>
              </div>
            ))}
          </div>
        )}

        <div className="animate-fade-in-up stagger-3">
          <SectionHeader title="Upcoming Assignments" />
          {upcoming.length === 0 ? (
            <EmptyState icon={Calendar} title="No upcoming assignments" description="New assignments will appear here" />
          ) : (
            upcoming.map((req) => (
              <div key={req.id} className="bg-card rounded-2xl border border-border p-4 mb-3 card-hover">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(req.date), 'MMM dd, yyyy')}
                  </span>
                  <span className="text-xs font-medium text-foreground">{req.time}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{req.destination}</p>
                <p className="text-xs text-muted-foreground">{req.meetingLocation}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
