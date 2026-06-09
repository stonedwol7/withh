'use client'

import { useRouter } from 'next/navigation'
import { CustomerHeader } from '@/components/shared/customer-nav'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { useAppStore } from '@/store/use-store'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/constants'
import { Route, PackageOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const statusIcons: Record<string, React.ReactNode> = {
  submitted: <Clock className="w-3.5 h-3.5 text-amber" />,
  reviewing: <AlertCircle className="w-3.5 h-3.5 text-blue" />,
  'finding-partner': <AlertCircle className="w-3.5 h-3.5 text-blue" />,
  'partner-assigned': <AlertCircle className="w-3.5 h-3.5 text-accent" />,
  'in-progress': <Clock className="w-3.5 h-3.5 text-accent animate-status-pulse" />,
  completed: <CheckCircle2 className="w-3.5 h-3.5 text-green" />,
  cancelled: <AlertCircle className="w-3.5 h-3.5 text-red" />,
}

const statusDots: Record<string, string> = {
  submitted: 'status-dot-pending',
  reviewing: 'status-dot-pending',
  'finding-partner': 'status-dot-pending',
  'partner-assigned': 'status-dot-pending',
  'in-progress': 'status-dot-active',
  completed: 'status-dot-inactive',
  cancelled: 'status-dot-inactive',
}

export default function JourneyPage() {
  const router = useRouter()
  const requests = useAppStore((s) => s.supportRequests)

  const active = requests.filter((r) => !['completed', 'cancelled', 'draft'].includes(r.status))
  const completed = requests.filter((r) => r.status === 'completed')

  if (requests.length === 0) {
    return (
      <div>
        <CustomerHeader title="My Journey" />
        <EmptyState
          icon={Route}
          title="Your journey starts here"
          description="Request your first support and watch your journey unfold"
          action={{ label: 'Request Support', onClick: () => router.push('/customer/request') }}
        />
      </div>
    )
  }

  return (
    <div>
      <CustomerHeader title="My Journey" />

      <div className="px-5 pt-6 pb-20">
        {active.length > 0 && (
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green animate-status-pulse" />
              Active ({active.length})
            </h2>
            <div className="relative">
              <div className="absolute left-[18px] top-3 bottom-3 w-px bg-border" />
              <div className="space-y-4">
                {active.map((req, idx) => (
                  <button
                    key={req.id}
                    onClick={() => router.push(`/customer/requests/${req.id}`)}
                    className="w-full flex gap-4 text-left group animate-fade-in-up"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="relative flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full border-2 border-border bg-card flex items-center justify-center shrink-0 z-10 group-hover:border-accent/50 transition-colors`}>
                        <span className="text-sm">{CATEGORY_ICONS[req.category]}</span>
                      </div>
                    </div>
                    <div className="flex-1 bg-card rounded-2xl border border-border p-4 group-hover:border-accent/30 transition-all card-hover min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {CATEGORY_LABELS[req.category]}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(req.date), 'MMM dd, yyyy')} at {req.time}
                      </p>
                      {req.destination && (
                        <p className="text-xs text-muted-foreground/60 mt-1 truncate">{req.destination}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDots[req.status] || 'status-dot-inactive'}`} />
                        {['submitted', 'reviewing', 'finding-partner'].includes(req.status) && 'Awaiting match'}
                        {req.status === 'partner-assigned' && 'Partner assigned'}
                        {req.status === 'in-progress' && 'Support in progress'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div className="animate-fade-in-up">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green" />
              Completed ({completed.length})
            </h2>
            <div className="space-y-3">
              {completed.map((req, idx) => (
                <button
                  key={req.id}
                  onClick={() => router.push(`/customer/requests/${req.id}`)}
                  className="w-full bg-card rounded-2xl border border-border p-4 text-left hover:border-accent/30 transition-all card-hover opacity-70 hover:opacity-100 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-sm opacity-60">{CATEGORY_ICONS[req.category]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {CATEGORY_LABELS[req.category]}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {format(new Date(req.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {active.length === 0 && completed.length > 0 && (
          <div className="text-center pt-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-4">
              <Route className="w-7 h-7 text-green" />
            </div>
            <p className="text-sm font-semibold text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No active journeys right now</p>
            <button
              onClick={() => router.push('/customer/request')}
              className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity btn-press"
            >
              Start new journey
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
