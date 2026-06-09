'use client'

import { useAppStore } from '@/store/use-store'
import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

const issueTypeLabels: Record<string, string> = {
  'partner-late': 'Partner Late',
  'customer-no-show': 'Customer No Show',
  cancellation: 'Cancellation',
  'safety-concern': 'Safety Concern',
  'payment-issue': 'Payment Issue',
}

const issueTypeColors: Record<string, string> = {
  'partner-late': 'bg-amber/10 text-amber',
  'customer-no-show': 'bg-red/10 text-red',
  cancellation: 'bg-muted text-muted-foreground',
  'safety-concern': 'bg-red/10 text-red',
  'payment-issue': 'bg-amber/10 text-amber',
}

export default function OpsIssues() {
  const issues = useAppStore((s) => s.issues)
  const supportRequests = useAppStore((s) => s.supportRequests)
  const resolveIssue = useAppStore((s) => s.resolveIssue)
  const [resolution, setResolution] = useState<Record<string, string>>({})

  const openIssues = issues.filter((i) => i.status === 'open')
  const resolvedIssues = issues.filter((i) => i.status === 'resolved')

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Issues</h1>

      {openIssues.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Open Issues</h2>
          <div className="space-y-4">
            {openIssues.map((issue) => {
              const req = supportRequests.find((r) => r.id === issue.requestId)
              return (
                <div key={issue.id} className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${issueTypeColors[issue.type]}`}>
                        {issueTypeLabels[issue.type]}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(issue.createdAt), 'MMM dd, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70 mb-2">{issue.description}</p>
                  {req && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Request: {req.destination} · {format(new Date(req.date), 'MMM dd')}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={resolution[issue.id] || ''}
                      onChange={(e) => setResolution({ ...resolution, [issue.id]: e.target.value })}
                      placeholder="Resolution notes..."
                      className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    <button
                      onClick={() => {
                        if (resolution[issue.id]) {
                          resolveIssue(issue.id, resolution[issue.id])
                        }
                      }}
                      disabled={!resolution[issue.id]}
                      className="bg-green text-white px-4 rounded-lg text-xs font-medium hover:opacity-90 transition-colors disabled:opacity-40"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {openIssues.length === 0 && (
        <div className="text-center py-16 mb-8">
          <CheckCircle className="w-12 h-12 text-green mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No open issues</p>
        </div>
      )}

      {resolvedIssues.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resolved</h2>
          <div className="space-y-3">
            {resolvedIssues.map((issue) => (
              <div key={issue.id} className="bg-card rounded-xl border border-border p-4 opacity-60">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {issueTypeLabels[issue.type]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{issue.resolution}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
