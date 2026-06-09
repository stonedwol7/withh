'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { OpsHeader } from '@/components/shared/ops-nav'
import { format } from 'date-fns'
import { Shield, Star, CheckCircle, Globe, Award } from 'lucide-react'

export default function OpsMatching() {
  const router = useRouter()
  const requests = useAppStore((s) => s.supportRequests)
  const updateStatus = useAppStore((s) => s.updateRequestStatus)

  const unassigned = requests.filter((r) => !r.assignedPartnerId && r.status !== 'completed' && r.status !== 'draft')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Matching</h1>
      <p className="text-sm text-muted-foreground mb-6">Review and match requests with available partners.</p>

      {unassigned.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle className="w-12 h-12 text-border mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">All requests have been assigned.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {unassigned.map((req) => (
            <button
              key={req.id}
              onClick={() => router.push(`/ops/matching/${req.id}`)}
              className="w-full bg-card rounded-xl border border-border p-5 text-left hover:border-accent/30 transition-all"
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">
                  {req.category === 'hospital' ? '🏥 Hospital Visit' :
                   req.category === 'government' ? '🏛️ Government Office' :
                   req.category === 'appointment' ? '📅 Appointment' :
                   req.category === 'elderly' ? '👴 Elderly Support' :
                   req.category === 'event' ? '🎉 Event' : '📋 Other'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(req.date), 'MMM dd')} at {req.time}
                </span>
              </div>
              <p className="text-sm text-foreground/70">{req.destination}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">
                  {req.genderPreference === 'no-preference' ? 'Any gender' : req.genderPreference}
                </span>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">
                  {req.languagePreference}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
