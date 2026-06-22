'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Tab = 'requests' | 'partners' | 'assignments'

interface Request {
  id: string
  customer_id: string
  category: string
  principal_name: string
  description: string
  meeting_location: string
  date: string
  time: string
  duration: string
  status: string
  created_at: string
}

interface Partner {
  id: string
  name: string
  phone: string
  email: string
  verification_status: string
  specialties: string[]
  languages: string[]
  bio: string
  rating: number
  completed_journeys: number
}

interface Assignment {
  id: string
  request_id: string
  partner_id: string
  status: string
  assigned_at: string
  requests: Request
  support_partners: Partner
}

export default function OpsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [tab, setTab] = useState<Tab>('requests')

  const [requests, setRequests] = useState<Request[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login?redirectTo=/ops'); return }
      fetch('/api/ops?type=requests').then((r) => {
        if (r.status === 403) { setAuthorized(false); setLoading(false); return }
        setAuthorized(true)
        loadAll()
      })
    })
  }, [])

  async function loadAll() {
    setLoading(true)
    const [reqs, prts, asgns] = await Promise.all([
      fetch('/api/ops?type=requests').then((r) => r.json()),
      fetch('/api/ops?type=partners').then((r) => r.json()),
      fetch('/api/ops?type=assignments').then((r) => r.json()),
    ])
    setRequests(reqs)
    setPartners(prts)
    setAssignments(asgns)
    setLoading(false)
  }

  const assignPartner = useCallback(async (requestId: string, partnerId: string) => {
    const res = await fetch('/api/ops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'assign', request_id: requestId, partner_id: partnerId }),
    })
    if (!res.ok) { toast.error('Assignment failed'); return }
    toast.success('Partner assigned')
    loadAll()
  }, [])

  const updateStatus = useCallback(async (requestId: string, status: string) => {
    const res = await fetch('/api/ops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', request_id: requestId, status }),
    })
    if (!res.ok) { toast.error('Update failed'); return }
    toast.success(`Status → ${status}`)
    loadAll()
  }, [])

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground">You are not authorized to access the ops portal.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border px-5 h-14 flex items-center justify-between z-50">
        <h1 className="text-sm font-bold text-foreground">WITHH Ops</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => { supabase.auth.signOut(); router.push('/') }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors">Sign out</button>
        </div>
      </header>

      <div className="flex border-b border-border">
          {(['requests', 'partners', 'assignments'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-medium transition-colors border-b-2 ${
              tab === t ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground/60 hover:text-muted-foreground'
            }`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : tab === 'requests' ? (
          <RequestsView requests={requests} partners={partners} onAssign={assignPartner} onStatus={updateStatus} />
        ) : tab === 'partners' ? (
          <PartnersView partners={partners} />
        ) : (
          <AssignmentsView assignments={assignments} />
        )}
      </div>
    </div>
  )
}

function RequestsView({ requests, partners, onAssign, onStatus }: {
  requests: Request[]
  partners: Partner[]
  onAssign: (rid: string, pid: string) => void
  onStatus: (rid: string, status: string) => void
}) {
  const [assigning, setAssigning] = useState<string | null>(null)
  const availablePartners = partners.filter((p) => p.verification_status === 'verified')

  const handleAssign = (rid: string, pid: string) => {
    if (!pid) return
    onAssign(rid, pid)
    setAssigning(null)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{requests.length} requests</p>
      {requests.map((r) => (
        <div key={r.id} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-foreground capitalize">
                {r.category} {r.principal_name && r.principal_name !== 'Myself' && <span className="text-muted-foreground">— for {r.principal_name}</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {r.date} at {r.time} &middot; {r.duration} &middot; {r.meeting_location}
              </p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
              r.status === 'requested' ? 'bg-amber/10 text-amber' :
              r.status === 'assigned' || r.status === 'in-progress' ? 'bg-blue/10 text-blue' :
              r.status === 'completed' ? 'bg-green/10 text-green' :
              'bg-muted text-muted-foreground'
            }`}>{r.status}</span>
          </div>

          {r.description && (
            <p className="text-xs text-foreground/70 mb-3 line-clamp-2">{r.description}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {r.status === 'requested' && (
              <>
                {assigning === r.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <select id={`partner-select-${r.id}`}
                      className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-xs focus:outline-none"
                      onChange={(e) => handleAssign(r.id, e.target.value)} defaultValue="">
                      <option value="" disabled>Select partner...</option>
                      {availablePartners.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.languages?.join(', ')})</option>
                      ))}
                    </select>
                    <button onClick={() => setAssigning(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setAssigning(r.id)}
                    className="text-xs bg-foreground text-background px-3 py-1.5 rounded-lg font-medium hover:bg-foreground/90 transition-colors">
                    Assign Partner
                  </button>
                )}
                <button onClick={() => onStatus(r.id, 'cancelled')}
                  className="text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg font-medium hover:bg-destructive/20 transition-colors">
                  Cancel
                </button>
              </>
            )}
            {r.status === 'assigned' && (
              <button onClick={() => onStatus(r.id, 'in-progress')}
                className="text-xs bg-foreground text-background px-3 py-1.5 rounded-lg font-medium hover:bg-foreground/90 transition-colors">
                Start Journey
              </button>
            )}
            {(r.status === 'assigned' || r.status === 'in-progress') && (
              <button onClick={() => onStatus(r.id, 'cancelled')}
                className="text-xs bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg font-medium hover:bg-destructive/20 transition-colors">
                Cancel
              </button>
            )}
            {(r.status === 'in-progress') && (
              <button onClick={() => onStatus(r.id, 'completed')}
                className="text-xs bg-green/10 text-green px-3 py-1.5 rounded-lg font-medium hover:bg-green/20 transition-colors">
                Mark Complete
              </button>
            )}
          </div>
        </div>
      ))}
      {requests.length === 0 && (
        <p className="text-xs text-muted-foreground/60 text-center py-8">No requests yet.</p>
      )}
    </div>
  )
}

function PartnersView({ partners }: { partners: Partner[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{partners.length} partners</p>
      {partners.map((p) => (
        <div key={p.id} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.email} {p.phone && <span>&middot; {p.phone}</span>}</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
              p.verification_status === 'verified' ? 'bg-green/10 text-green' :
              p.verification_status === 'pending' ? 'bg-amber/10 text-amber' :
              p.verification_status === 'rejected' ? 'bg-red/10 text-red' :
              'bg-muted text-muted-foreground'
            }`}>{p.verification_status}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {p.specialties?.map((s) => (
              <span key={s} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">{s}</span>
            ))}
          </div>
          <p className="text-xs text-foreground/60 line-clamp-2">{p.bio}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span>{p.languages?.length} languages</span>
            <span>{p.completed_journeys} journeys</span>
            {p.rating > 0 && <span>{p.rating.toFixed(1)} rating</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function AssignmentsView({ assignments }: { assignments: Assignment[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{assignments.length} assignments</p>
      {assignments.map((a) => (
        <div key={a.id} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start justify-between mb-1">
            <p className="text-sm font-semibold text-foreground">
              {a.requests?.category || 'Request'} → {a.support_partners?.name || 'Partner'}
            </p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
              a.status === 'accepted' ? 'bg-blue/10 text-blue' :
              a.status === 'completed' ? 'bg-green/10 text-green' :
              a.status === 'assigned' ? 'bg-amber/10 text-amber' :
              'bg-muted text-muted-foreground'
            }`}>{a.status}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {a.requests?.date} at {a.requests?.time} &middot; {a.requests?.meeting_location}
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">Assigned {new Date(a.assigned_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}


