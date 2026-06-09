'use client'

import { useRouter } from 'next/navigation'
import { CustomerHeader } from '@/components/shared/customer-nav'
import { StatusBadge } from '@/components/shared/status-badge'
import { SectionHeader } from '@/components/shared/section-header'
import { EmptyState } from '@/components/shared/empty-state'
import { useAppStore } from '@/store/use-store'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/constants'
import { ClipboardList, PackageOpen } from 'lucide-react'
import { format } from 'date-fns'

export default function CustomerRequests() {
  const router = useRouter()
  const requests = useAppStore((s) => s.supportRequests)

  const active = requests.filter((r) => !['completed', 'cancelled', 'draft'].includes(r.status))
  const completed = requests.filter((r) => r.status === 'completed')

  return (
    <div>
      <CustomerHeader title="Requests" />

      <div className="px-5 pt-6 pb-20">
        {active.length > 0 && (
          <div className="mb-8">
            <SectionHeader title="Active" />
            <div className="space-y-3">
              {active.map((req) => (
                <button
                  key={req.id}
                  onClick={() => router.push(`/customer/requests/${req.id}`)}
                  className="w-full bg-card rounded-2xl border border-border p-4 text-left hover:border-accent/30 transition-all card-hover"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CATEGORY_ICONS[req.category]}</span>
                      <span className="text-sm font-semibold text-foreground">{CATEGORY_LABELS[req.category]}</span>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(req.date), 'MMM dd, yyyy')} at {req.time}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{req.destination}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionHeader title="Completed" />
          {completed.length === 0 ? (
            <EmptyState icon={PackageOpen} title="No completed requests yet" description="Your completed support journeys will appear here" />
          ) : (
            <div className="space-y-3">
              {completed.map((req) => (
                <button
                  key={req.id}
                  onClick={() => router.push(`/customer/requests/${req.id}`)}
                  className="w-full bg-card rounded-2xl border border-border p-4 text-left hover:border-accent/30 transition-all opacity-60 hover:opacity-100 card-hover"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CATEGORY_ICONS[req.category]}</span>
                      <span className="text-sm font-medium text-muted-foreground">{CATEGORY_LABELS[req.category]}</span>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-muted-foreground/60">
                    {format(new Date(req.date), 'MMM dd, yyyy')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
