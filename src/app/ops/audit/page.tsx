'use client'

import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/use-store'
import { Search, Clock, User, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { CATEGORY_ICONS } from '@/lib/constants'
import type { OperationEvent, SupportRequest } from '@/lib/types'

const eventTypeIcons: Record<string, string> = {
  'status-change': '🔄',
  'note': '📝',
  'assignment': '🤝',
  'payment': '💳',
  'issue': '⚠️',
  'system': '⚙️',
}

export default function OpsAuditPage() {
  const events = useAppStore((s) => s.operationEvents)
  const requests = useAppStore((s) => s.supportRequests)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const allEvents = useMemo(() => {
    const result: { event: OperationEvent; request: SupportRequest | undefined }[] = []
    Object.entries(events).forEach(([reqId, evts]) => {
      const req = requests.find((r) => r.id === reqId)
      evts.forEach((evt) => result.push({ event: evt, request: req }))
    })
    return result.sort((a, b) => b.event.timestamp.localeCompare(a.event.timestamp))
  }, [events, requests])

  const filtered = useMemo(() => {
    return allEvents.filter(({ event, request }) => {
      if (filterType !== 'all' && event.type !== filterType) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          event.content.toLowerCase().includes(q) ||
          event.operatorName.toLowerCase().includes(q) ||
          request?.id?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [allEvents, filterType, search])

  return (
    <div>
      <div className="bg-card border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-foreground">Audit Log</h1>
        <div className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-muted rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-muted rounded-xl px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="status-change">Status</option>
            <option value="note">Notes</option>
            <option value="assignment">Assignments</option>
            <option value="payment">Payments</option>
            <option value="issue">Issues</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="px-6 py-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No matching events</p>
          </div>
        ) : (
          filtered.map(({ event, request }, idx) => (
            <div key={event.id || idx} className="bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition-all">
              <div className="flex items-start gap-3">
                <span className="text-lg">{eventTypeIcons[event.type] || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{event.content}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {event.operatorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {format(new Date(event.timestamp), 'MMM dd, h:mm a')}
                    </span>
                    {request && (
                      <span className="flex items-center gap-1">
                        {CATEGORY_ICONS[request.category] || '📋'} {request.id}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">{event.type}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
