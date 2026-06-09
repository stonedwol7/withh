'use client'

import { useRouter } from 'next/navigation'
import { PartnerHeader } from '@/components/shared/partner-nav'
import { useAppStore } from '@/store/use-store'
import { useAuthStore } from '@/store/auth-store'
import { useMemo } from 'react'
import { format } from 'date-fns'

const categoryLabels: Record<string, string> = {
  hospital: 'Hospital Visit',
  government: 'Government Office',
  interview: 'Interview',
  elderly: 'Elderly Support',
  event: 'Event',
  other: 'Other',
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue/10 text-blue',
  'partner-assigned': 'bg-purple/10 text-purple',
  confirmed: 'bg-green/10 text-green',
  'partner-en-route': 'bg-blue/10 text-blue',
  'partner-arrived': 'bg-green/10 text-green',
  'in-progress': 'bg-accent/10 text-accent',
  completed: 'bg-muted text-muted-foreground',
}

export default function PartnerAssignments() {
  const router = useRouter()
  const userName = useAuthStore((s) => s.userName)
  const partners = useAppStore((s) => s.supportPartners)
  const allRequests = useAppStore((s) => s.supportRequests)

  const partnerId = useMemo(() => {
    const p = partners.find((p) => userName.includes(p.name.split(' ')[0]))
    return p?.id || 'partner-2'
  }, [userName, partners])

  const requests = useMemo(
    () => allRequests.filter((r) => r.assignedPartnerId === partnerId),
    [allRequests, partnerId]
  )

  const active = requests.filter((r) => !['completed', 'cancelled'].includes(r.status))
  const completed = requests.filter((r) => r.status === 'completed')

  return (
    <div>
      <PartnerHeader title="Assignments" />

      <div className="px-5 pt-6 pb-6">
        {active.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Active</h2>
            <div className="space-y-3">
              {active.map((req) => (
                <button
                  key={req.id}
                  onClick={() => router.push(`/partner/assignments/${req.id}`)}
                  className="w-full bg-card rounded-2xl border border-border p-4 text-left hover:border-accent/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">
                      {categoryLabels[req.category]}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${statusColors[req.status]}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70 font-medium">{req.destination}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(req.date), 'MMM dd, yyyy')} at {req.time}
                  </p>
                  <p className="text-xs text-muted-foreground">{req.meetingLocation}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Completed</h2>
          {completed.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No completed assignments.</p>
          ) : (
            <div className="space-y-3">
              {completed.map((req) => (
                <div key={req.id} className="bg-card rounded-2xl border border-border p-4 opacity-60">
                  <p className="text-sm font-medium text-muted-foreground">{categoryLabels[req.category]}</p>
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(req.date), 'MMM dd, yyyy')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
