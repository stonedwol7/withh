'use client'

import { useAppStore } from '@/store/use-store'
import { format } from 'date-fns'
import { useMemo } from 'react'
import { Play, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const statusColors: Record<string, string> = {
  'partner-en-route': 'bg-blue/10 text-blue',
  'partner-arrived': 'bg-green/10 text-green',
  'in-progress': 'bg-accent/10 text-accent',
  completed: 'bg-muted text-muted-foreground',
}

const categoryLabels: Record<string, string> = {
  hospital: '🏥',
  government: '🏛️',
  appointment: '📅',
  elderly: '👴',
  event: '🎉',
  other: '📋',
}

export default function OpsActiveSupports() {
  const router = useRouter()
  const allRequests = useAppStore((s) => s.supportRequests)

  const active = useMemo(
    () => allRequests.filter((r) => ['partner-en-route', 'partner-arrived', 'in-progress'].includes(r.status)),
    [allRequests]
  )
  const confirmed = useMemo(
    () => allRequests.filter((r) => r.status === 'confirmed'),
    [allRequests]
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Active Supports</h1>
          <p className="text-sm text-muted-foreground">{active.length} currently active</p>
        </div>
      </div>

      <div className="space-y-4">
        {active.length === 0 && confirmed.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle className="w-12 h-12 text-border mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No active supports</p>
          </div>
        ) : (
          <>
            {active.map((req) => (
              <div key={req.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryLabels[req.category]}</span>
                    <span className="text-sm font-semibold text-foreground">
                      {req.category === 'hospital' ? 'Hospital Visit' :
                       req.category === 'government' ? 'Government Office' :
                       req.category === 'appointment' ? 'Appointment' :
                       req.category === 'elderly' ? 'Elderly' :
                       req.category === 'event' ? 'Event' : 'Support'}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Meeting Point</p>
                    <p className="text-xs text-foreground/70 truncate">{req.meetingLocation}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Destination</p>
                    <p className="text-xs text-foreground/70 truncate">{req.destination}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Schedule</p>
                    <p className="text-xs text-foreground/70">{format(new Date(req.date), 'MMM dd')} {req.time}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Partner</p>
                    <p className="text-xs text-foreground/70">{req.assignedPartnerId ? 'Assigned' : '—'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="text-[10px] bg-blue/10 text-blue px-2 py-0.5 rounded-full">Customer: Priya S.</span>
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Duration: {req.duration}</span>
                </div>
              </div>
            ))}

            {confirmed.map((req) => (
              <div key={req.id} className="bg-card rounded-xl border border-border p-5 border-l-4 border-l-accent">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryLabels[req.category]}</span>
                    <span className="text-sm font-semibold text-foreground">Confirmed</span>
                  </div>
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-1 text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium"
                  >
                    <Play className="w-3 h-3" /> Start
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{req.destination}</p>
                <p className="text-xs text-muted-foreground mt-1">{format(new Date(req.date), 'MMM dd, yyyy')} at {req.time}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
