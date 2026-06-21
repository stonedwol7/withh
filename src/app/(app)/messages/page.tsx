import { createClient } from '@/lib/supabase/server'
import { Shield, CheckCircle, Users, Sparkles, MessageSquare } from 'lucide-react'
import { redirect } from 'next/navigation'

const EVENT_ICONS: Record<string, any> = {
  request_created: Shield,
  under_review: Sparkles,
  partner_assigned: Users,
  journey_started: Users,
  journey_completed: CheckCircle,
}

const EVENT_LABELS: Record<string, string> = {
  request_created: 'Request received',
  under_review: 'Reviewing details',
  partner_assigned: 'Partner assigned — waiting for your confirmation',
  journey_started: 'Support started',
  journey_completed: 'Support completed',
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawRequests } = await (supabase as any)
    .from('requests')
    .select('id')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const requestIds = ((rawRequests || []) as any[]).map((r: any) => r.id)

  const { data: rawEvents } = await (supabase as any)
    .from('journey_events')
    .select('*')
    .in('request_id', requestIds.length > 0 ? requestIds : ['none'])
    .order('created_at', { ascending: false })
    .limit(20)

  const events = (rawEvents || []) as any[]

  return (
    <div className="max-w-lg mx-auto px-5 pt-8 pb-8">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Messages</h1>
      <p className="text-sm text-muted-foreground mb-8">Journey updates.</p>

      {(!events || events.length === 0) ? (
        <div className="text-center py-16">
          <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground/50">No updates yet.</p>
          <p className="text-xs text-muted-foreground/30 mt-1">Submit a request to see updates here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const Icon = EVENT_ICONS[event.event_type] || Shield
            return (
              <div key={event.id} className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-foreground/60">WITHH</p>
                  <p className="text-sm text-foreground">{EVENT_LABELS[event.event_type] || event.event_type}</p>
                  {event.notes && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{event.notes}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {event.created_at ? new Date(event.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
