import { createClient } from '@/lib/supabase/server'
import { CheckCircle, Clock, Loader2, ArrowRight, AlertCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function JourneyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawRequests, error } = await (supabase as any)
    .from('requests')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const requests = (rawRequests || []) as any[]

  return (
    <div className="max-w-lg mx-auto px-5 pt-8 pb-8">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Journey</h1>
      <p className="text-sm text-muted-foreground mb-8">What&apos;s happening next.</p>

      {error && (
        <div className="bg-red/5 border border-red/10 rounded-2xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="w-4 h-4 text-red shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-red">Something went wrong</p>
            <p className="text-[10px] text-red/60 mt-0.5">Could not load your requests. Please try again.</p>
          </div>
        </div>
      )}

      {!error && requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Clock className="w-5 h-5 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground/50">No journeys yet</p>
          <p className="text-xs text-muted-foreground/30 mt-1">Submit a support request to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => {
            const statusSteps = [
              { key: 'requested', label: 'Received' },
              { key: 'assigned', label: 'Assigned' },
              { key: 'in-progress', label: 'In progress' },
              { key: 'completed', label: 'Completed' },
            ]

            const currentIdx = statusSteps.findIndex((s) => s.key === req.status)

            return (
              <Link
                key={req.id}
                href={`/journey/${req.id}`}
                className="block bg-card rounded-2xl border border-border p-4 hover:border-primary/20 transition-all card-hover"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                    {req.description || 'Support request'}
                  </p>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-0.5" />
                </div>

                <p className="text-[10px] text-muted-foreground/50 mb-4">
                  {req.date || ''}{req.time ? ` at ${req.time?.slice(0, 5)}` : ''}
                  {req.meeting_location ? ` · ${req.meeting_location}` : ''}
                </p>

                <div className="flex items-center gap-3">
                  {statusSteps.map((step, i) => {
                    const status = i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'upcoming'
                    const Icon = status === 'done' ? CheckCircle : status === 'current' ? Loader2 : Clock
                    return (
                      <div key={step.key} className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          status === 'done' ? 'bg-primary/10 text-primary' :
                          status === 'current' ? 'bg-accent/10 text-accent' :
                          'bg-muted'
                        }`}>
                          <Icon className={`w-2.5 h-2.5 ${status === 'current' ? 'animate-spin' : ''}`} />
                        </div>
                        <span className={`text-[9px] ${
                          status === 'done' ? 'text-foreground/80' :
                          status === 'current' ? 'text-accent font-medium' :
                          'text-muted-foreground/30'
                        }`}>{step.label}</span>
                      </div>
                    )
                  })}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
