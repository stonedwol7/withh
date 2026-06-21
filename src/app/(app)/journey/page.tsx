import { createClient } from '@/lib/supabase/server'
import { Shield, CheckCircle, Clock, Users, Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'

const EVENT_ICONS: Record<string, any> = {
  request_created: Shield,
  under_review: Clock,
  partner_assigned: Users,
  partner_accepted: Users,
  journey_started: Clock,
  journey_completed: CheckCircle,
}

const EVENT_LABELS: Record<string, string> = {
  request_created: 'Request received',
  under_review: 'Reviewing details',
  partner_assigned: 'Partner assigned',
  partner_accepted: 'Partner accepted',
  journey_started: 'Support started',
  journey_completed: 'Support completed',
}

export default async function JourneyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawRequests } = await supabase
    .from('requests')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const requests = (rawRequests || []) as any[]

  return (
    <div className="max-w-lg mx-auto px-5 pt-8 pb-8">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Journey</h1>
      <p className="text-sm text-muted-foreground mb-8">What&apos;s happening next.</p>

      {(!requests || requests.length === 0) ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground/50">No requests yet.</p>
          <p className="text-xs text-muted-foreground/30 mt-1">Submit a request to see your journey here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => {
            const statusSteps = [
              { key: 'requested', label: 'Request received' },
              { key: 'assigned', label: 'Partner assigned' },
              { key: 'in-progress', label: 'Support started' },
              { key: 'completed', label: 'Support completed' },
            ]

            const currentIdx = statusSteps.findIndex((s) => s.key === req.status)

            return (
              <div key={req.id} className="bg-card rounded-2xl border border-border p-4">
                <p className="text-sm font-medium text-foreground mb-3">
                  {req.description?.slice(0, 60)}{req.description && req.description.length > 60 ? '...' : ''}
                </p>
                <p className="text-[10px] text-muted-foreground/50 mb-4">
                  {req.date || ''}{req.time ? ` at ${req.time}` : ''}
                </p>
                <div className="space-y-3">
                  {statusSteps.map((step, i) => {
                    const status = i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'upcoming'
                    const Icon = status === 'done' ? CheckCircle : status === 'current' ? Loader2 : Clock
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          status === 'done' ? 'bg-primary/10 text-primary' :
                          status === 'current' ? 'bg-accent/10 text-accent' :
                          'bg-muted text-muted-foreground/30'
                        }`}>
                          <Icon className={`w-3 h-3 ${status === 'current' ? 'animate-spin' : ''}`} />
                        </div>
                        <span className={`text-xs ${
                          status === 'done' ? 'text-foreground' :
                          status === 'current' ? 'text-accent font-medium' :
                          'text-muted-foreground/40'
                        }`}>{step.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
