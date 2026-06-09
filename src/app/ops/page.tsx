'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { Search, Filter, Clock, CheckCircle, AlertCircle, Brain, AlertTriangle } from 'lucide-react'
import { riskFlagLabels } from '@/lib/ai-engine'

const categoryLabels: Record<string, string> = {
  hospital: '🏥 Hospital',
  government: '🏛️ Government',
  appointment: '📅 Appointment',
  elderly: '👴 Elderly',
  event: '🎉 Event',
  other: '📋 Other',
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue/10 text-blue',
  reviewing: 'bg-amber/10 text-amber',
  'finding-partner': 'bg-amber/10 text-amber',
  'partner-assigned': 'bg-purple/10 text-purple',
  confirmed: 'bg-green/10 text-green',
  'partner-en-route': 'bg-blue/10 text-blue',
  'partner-arrived': 'bg-green/10 text-green',
  'in-progress': 'bg-accent/10 text-accent',
  completed: 'bg-muted text-muted-foreground',
}

export default function OpsDashboard() {
  const router = useRouter()
  const requests = useAppStore((s) => s.supportRequests)
  const updateStatus = useAppStore((s) => s.updateRequestStatus)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = requests.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false
    if (search && !r.destination.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const pending = requests.filter((r) => r.status === 'submitted' || r.status === 'reviewing')
  const aiAnalyses = useAppStore((s) => s.aiAnalyses)
  const runAnalysis = useAppStore((s) => s.runAiAnalysis)

  useEffect(() => {
    pending.forEach((r) => {
      if (!aiAnalyses[r.id]) runAnalysis(r.id)
    })
  }, [requests.length])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Requests</h1>
          <p className="text-sm text-muted-foreground">{pending.length} pending review</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-card border border-border rounded-lg py-2 pl-9 pr-3 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-card border border-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="reviewing">Reviewing</option>
            <option value="finding-partner">Finding Partner</option>
            <option value="partner-assigned">Assigned</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Needs Review</h2>
          <div className="space-y-3">
            {pending.map((req) => (
              <div key={req.id} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{categoryLabels[req.category]}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(req.date), 'MMM dd, yyyy')} at {req.time}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{req.destination}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        updateStatus(req.id, 'reviewing')
                      }}
                      className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-colors"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => router.push(`/ops/matching/${req.id}`)}
                      className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-colors"
                    >
                      Match
                    </button>
                  </div>
                </div>
                {aiAnalyses[req.id]?.riskFlags && aiAnalyses[req.id].riskFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {aiAnalyses[req.id].riskFlags.map((flag) => {
                      const config = riskFlagLabels[flag]
                      return (
                        <span
                          key={flag}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${config.color.split(' ')[0]} ${config.color.split(' ')[1]}`}
                        >
                          {config.icon} {config.label}
                        </span>
                      )
                    })}
                  </div>
                )}
                {aiAnalyses[req.id]?.tags && aiAnalyses[req.id].tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {aiAnalyses[req.id].tags.slice(0, 5).map((tag) => (
                      <span key={tag} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {req.description && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">{req.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Requests</h2>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Type</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Date</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Destination</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Partner</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">{categoryLabels[req.category]}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(req.date), 'MMM dd')} {req.time}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{req.destination}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {req.assignedPartnerId ? 'Assigned' : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/ops/matching/${req.id}`)}
                        className="text-xs text-accent font-medium hover:underline"
                      >
                        Match
                      </button>
                      {aiAnalyses[req.id] && aiAnalyses[req.id].riskFlags.length > 0 && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      {aiAnalyses[req.id] && aiAnalyses[req.id].riskFlags.length === 0 && (
                        <Brain className="w-3.5 h-3.5 text-muted-foreground/30" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
