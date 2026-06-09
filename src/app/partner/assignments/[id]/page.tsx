'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { PartnerHeader } from '@/components/shared/partner-nav'
import { format } from 'date-fns'
import { MapPin, Clock, Phone, Navigation, CheckCircle } from 'lucide-react'
import type { RequestStatus } from '@/lib/types'

const categoryLabels: Record<string, string> = {
  hospital: 'Hospital Visit',
  government: 'Government Office',
  appointment: 'Appointment',
  elderly: 'Elderly Support',
  event: 'Event',
  other: 'Other',
}

export default function AssignmentDetail() {
  const params = useParams()
  const router = useRouter()
  const request = useAppStore((s) => s.getRequest(params.id as string))
  const updateStatus = useAppStore((s) => s.updateRequestStatus)

  if (!request) {
    return (
      <div>
        <PartnerHeader title="Assignment" />
        <div className="px-5 py-20 text-center">
          <p className="text-muted-foreground">Assignment not found.</p>
        </div>
      </div>
    )
  }

  const statusSteps: { key: RequestStatus; label: string }[] = [
    { key: 'confirmed', label: 'Accept Assignment' },
    { key: 'partner-en-route', label: 'Start Travel' },
    { key: 'partner-arrived', label: 'Arrived' },
    { key: 'in-progress', label: 'Start Support' },
    { key: 'completed', label: 'Complete Support' },
  ]

  const currentIdx = statusSteps.findIndex((s) => s.key === request.status)

  return (
    <div>
      <PartnerHeader title="Assignment" />

      <div className="px-5 pt-6 pb-24">
        <div className="bg-card rounded-2xl border border-border p-5 mb-5">
          <h2 className="text-lg font-semibold text-foreground mb-1">{categoryLabels[request.category]}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {format(new Date(request.date), 'EEEE, MMMM dd, yyyy')} at {request.time}
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Meeting Point</p>
                <p className="text-sm text-foreground/70">{request.meetingLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-accent mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-medium text-foreground">{request.destination}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm text-foreground/70">{request.duration === 'under-2' ? 'Under 2 hours' : request.duration === '2-4' ? '2-4 hours' : 'More than 4 hours'}</p>
              </div>
            </div>
          </div>
        </div>

        {request.description && (
          <div className="bg-card rounded-2xl border border-border p-5 mb-5">
            <p className="text-xs text-muted-foreground mb-1">Customer Notes</p>
            <p className="text-sm text-foreground/70">{request.description}</p>
          </div>
        )}

        <div className="bg-card rounded-2xl border border-border p-5 mb-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Support Flow</h3>
          <div className="space-y-0">
            {statusSteps.map((step, idx) => {
              const isActive = idx === currentIdx
              const isPast = idx < currentIdx
              const isFuture = idx > currentIdx

              return (
                <button
                  key={step.key}
                  onClick={() => {
                    if (isActive) {
                      updateStatus(request.id, step.key)
                    }
                  }}
                  disabled={!isActive}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl mb-2 transition-all ${
                    isPast
                      ? 'bg-green/5 text-muted-foreground'
                      : isActive
                        ? 'bg-accent/5 text-accent border border-accent/20'
                        : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    isPast ? 'bg-green' : isActive ? 'bg-accent' : 'bg-border'
                  }`}>
                    {isPast ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-border'}`} />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-accent' : isPast ? 'text-muted-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="text-[10px] text-accent ml-auto">Click to update</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl text-sm font-medium hover:opacity-90">
            <Phone className="w-4 h-4" /> Call
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-xl text-sm font-medium hover:opacity-90">
            <Navigation className="w-4 h-4" /> Navigate
          </button>
        </div>
      </div>
    </div>
  )
}
