'use client'

import { Check } from 'lucide-react'

const statusConfig: Record<string, { label: string; description: string }> = {
  submitted: { label: 'Request Received', description: 'We have received your support request.' },
  reviewing: { label: 'Reviewing Request', description: 'Our team is reviewing your request.' },
  'finding-partner': { label: 'Finding The Right Support Partner', description: 'We are matching you with the best available partner.' },
  'partner-assigned': { label: 'Partner Assigned', description: 'A Support Partner has been assigned to you.' },
  'awaiting-customer-confirmation': { label: 'Awaiting Confirmation', description: 'Please review and confirm your match.' },
  confirmed: { label: 'Support Confirmed', description: 'Your support journey is confirmed.' },
  'partner-en-route': { label: 'Partner En Route', description: 'Your partner is on the way.' },
  'partner-arrived': { label: 'Partner Arrived', description: 'Your partner has arrived at the location.' },
  'in-progress': { label: 'Support In Progress', description: 'Your support journey is underway.' },
  completed: { label: 'Completed', description: 'Support journey completed.' },
}

const statusOrder = [
  'submitted',
  'reviewing',
  'finding-partner',
  'partner-assigned',
  'awaiting-customer-confirmation',
  'confirmed',
  'partner-en-route',
  'partner-arrived',
  'in-progress',
  'completed',
]

export function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIdx = statusOrder.indexOf(currentStatus)

  if (currentIdx === -1) return null

  const relevantStatuses = statusOrder.slice(0, currentIdx + 1)

  return (
    <div className="space-y-0">
      {relevantStatuses.map((key, idx) => {
        const config = statusConfig[key]
        const isActive = idx === currentIdx
        const isComplete = idx < currentIdx

        return (
          <div key={key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isComplete
                    ? 'bg-green'
                    : isActive
                      ? 'bg-accent animate-status-pulse'
                      : 'bg-border'
                }`}
              >
                {isComplete ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-white' : 'bg-muted-foreground/40'}`} />
                )}
              </div>
              {idx < relevantStatuses.length - 1 && (
                <div className={`w-0.5 h-8 ${isComplete ? 'bg-green' : 'bg-border'}`} />
              )}
            </div>
            <div className={`pb-6`}>
              <p className={`text-sm font-medium ${
                isActive ? 'text-foreground' : isComplete ? 'text-muted-foreground' : 'text-muted-foreground/50'
              }`}>
                {config.label}
              </p>
              {isActive && (
                <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
