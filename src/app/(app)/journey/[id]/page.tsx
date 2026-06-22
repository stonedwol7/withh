import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Shield, CheckCircle, Clock, Users, Loader2, MapPin, Calendar, Languages, User } from 'lucide-react'
import Link from 'next/link'
import LocationMap from '@/components/maps/location-map'

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawRequests } = await (supabase as any)
    .from('requests')
    .select('*')
    .eq('id', id)
    .eq('customer_id', user.id)
    .limit(1)

  const request = ((rawRequests || []) as any[])[0]

  if (!request) notFound()

  const { data: rawEvents } = await (supabase as any)
    .from('journey_events')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: true })

  const events = (rawEvents || []) as any[]

  const statusSteps = [
    { key: 'requested', label: 'Request received' },
    { key: 'assigned', label: 'Partner assigned' },
    { key: 'in-progress', label: 'Support started' },
    { key: 'completed', label: 'Support completed' },
  ]

  const currentIdx = statusSteps.findIndex((s) => s.key === request.status)

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-8">
      <Link href="/journey" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Journey
      </Link>

      <div className="bg-card rounded-3xl border border-border overflow-hidden mb-6">
        <div className="p-5 space-y-4">
          <div>
            <h1 className="text-sm font-semibold text-foreground">{request.description || 'Support request'}</h1>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {request.date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground/50" />
                {request.date}{request.time ? ` at ${request.time?.slice(0, 5)}` : ''}
              </span>
            )}
            {request.meeting_location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground/50" />
                {request.meeting_location}
              </span>
            )}
            {request.preferred_gender && request.preferred_gender !== 'no-preference' && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground/50" />
                {request.preferred_gender === 'female' ? 'Female partner' : 'Male partner'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border p-5">
        <h2 className="text-xs font-semibold text-foreground/80 mb-5 uppercase tracking-wide">Progress</h2>
        <div className="space-y-4">
          {statusSteps.map((step, i) => {
            const status = i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'upcoming'
            const Icon = status === 'done' ? CheckCircle : status === 'current' ? Loader2 : Clock
            const event = events.find((e: any) => e.event_type === step.key.replace('-', '_'))

            return (
              <div key={step.key} className="flex gap-3">
                <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  status === 'done' ? 'bg-primary/10 text-primary' :
                  status === 'current' ? 'bg-accent/10 text-accent' :
                  'bg-muted text-muted-foreground/30'
                }`}>
                  <Icon className={`w-3.5 h-3.5 ${status === 'current' ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <p className={`text-sm ${
                    status === 'done' ? 'text-foreground' :
                    status === 'current' ? 'text-accent font-medium' :
                    'text-muted-foreground/40'
                  }`}>{step.label}</p>
                  {event && (
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      {event.created_at ? new Date(event.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  )}
                  {event?.notes && (
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">{event.notes}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {request.meeting_location && (
        <div className="mt-6 bg-card rounded-3xl border border-border overflow-hidden">
          <div className="p-4 pb-3">
            <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">Meeting location</p>
            <p className="text-xs text-muted-foreground mt-0.5">{request.meeting_location}</p>
          </div>
          <LocationMap location={request.meeting_location} height="200px" />
        </div>
      )}
    </div>
  )
}
