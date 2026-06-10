import { create } from 'zustand'
import type { SupabaseClient } from '@supabase/supabase-js'

let _supabaseClient: SupabaseClient | null = null
async function getSupabase(): Promise<SupabaseClient> {
  if (!_supabaseClient) {
    const mod = await import('@/lib/supabase/client')
    _supabaseClient = mod.supabase
  }
  return _supabaseClient
}
import type {
  SupportRequest, SupportPartner, Match, JourneyMessage,
  Payment, Issue, SupportCategory, SupportDuration, GenderPreference,
  Language, WhoNeedsSupport, RequestStatus, PartnerEarning,
  FinanceRecord, OperationEvent, AiAnalysis, AiMatchRecommendation,
  SupportTicket, TicketMessage,
} from '@/lib/types'
import {
  currentCustomer, supportPartners as mockPartners, supportRequests as mockRequests,
  matches as mockMatches, journeyMessages as mockMessages, payments as mockPayments,
  operationEvents as mockEvents, issues as mockIssues, partnerEarnings as mockEarnings,
  financeRecords as mockFinance,
} from '@/lib/mock-data'

interface RequestDraft {
  whoNeedsSupport?: WhoNeedsSupport
  someoneElseName?: string; someoneElsePhone?: string; someoneElseRelationship?: string
  category?: SupportCategory; otherCategoryDescription?: string
  meetingLocation?: string; destination?: string; date?: string; time?: string
  duration?: SupportDuration; description?: string; accessibilityNeeds?: string
  genderPreference?: GenderPreference; languagePreference?: Language | 'no-preference'
  trustedContactName?: string; trustedContactPhone?: string; trustedContactRelationship?: string
}

interface AppState {
  initialized: boolean; currentCustomerId: string; authUserId: string | null
  supportRequests: SupportRequest[]; supportPartners: SupportPartner[]
  matches: Match[]; journeyMessages: Record<string, JourneyMessage[]>
  payments: Payment[]; operationEvents: Record<string, OperationEvent[]>
  issues: Issue[]; partnerEarnings: PartnerEarning[]; financeRecords: FinanceRecord[]
  supportTickets: SupportTicket[]; ticketMessages: TicketMessage[]
  requestDraft: RequestDraft
  initialize: () => Promise<void>
  setRequestDraft: (draft: Partial<RequestDraft>) => void; resetRequestDraft: () => void
  submitRequest: () => Promise<string | null>
  getRequest: (id: string) => SupportRequest | undefined
  getCustomer: () => typeof currentCustomer
  getPartner: (id: string) => SupportPartner | undefined
  getPartnerByRequest: (requestId: string) => SupportPartner | undefined
  getMatchByRequest: (requestId: string) => Match | undefined
  getMessagesByRequest: (requestId: string) => JourneyMessage[]
  getPaymentByRequest: (requestId: string) => Payment | undefined
  getEventsByRequest: (requestId: string) => OperationEvent[]
  getIssuesByRequest: (requestId: string) => Issue[]
  assignPartner: (requestId: string, partnerId: string) => Promise<void>
  confirmMatch: (matchId: string) => void
  processPayment: (requestId: string) => void
  updateRequestStatus: (requestId: string, status: RequestStatus) => void
  addMessage: (requestId: string, message: JourneyMessage) => void
  addIssue: (issue: Issue) => void; resolveIssue: (issueId: string, resolution: string) => void
  addEvent: (requestId: string, event: OperationEvent) => void
  getAvailablePartners: () => SupportPartner[]
  getActiveSupports: () => SupportRequest[]
  getPendingRequests: () => SupportRequest[]
  getPartnerAssignments: (partnerId: string) => SupportRequest[]
  getPartnerEarnings: (partnerId: string) => PartnerEarning[]
  getFinanceRecords: () => FinanceRecord[]
  addTicket: (ticket: SupportTicket) => void; addTicketMessage: (msg: TicketMessage) => void
  aiAnalyses: Record<string, AiAnalysis>
  aiRecommendations: Record<string, AiMatchRecommendation>
  aiLoading: boolean
  runAiAnalysis: (requestId: string) => Promise<void>
  runAiMatching: (requestId: string) => Promise<void>
  getAiAnalysis: (requestId: string) => AiAnalysis | undefined
  getAiRecommendation: (requestId: string) => AiMatchRecommendation | undefined
}

function s2c(r: any): any {
  if (!r || typeof r !== 'object') return r
  const out: any = Array.isArray(r) ? [] : {}
  for (const [k, v] of Object.entries(r)) {
    const ck = k.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
    out[ck] = v
  }
  return out
}

let eventCounter = 4

export const useAppStore = create<AppState>((set, get) => ({
  initialized: false, currentCustomerId: 'cust-1', authUserId: null,
  supportRequests: [...mockRequests], supportPartners: [...mockPartners],
  matches: [...mockMatches], journeyMessages: JSON.parse(JSON.stringify(mockMessages)),
  payments: [...mockPayments], operationEvents: JSON.parse(JSON.stringify(mockEvents)),
  issues: [...mockIssues], partnerEarnings: [...mockEarnings], financeRecords: [...mockFinance],
  supportTickets: [], ticketMessages: [],
  requestDraft: {},

  initialize: async () => {
    if (get().initialized) return
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { set({ initialized: true }); return }

    const authId = user.id
    set({ authUserId: authId })

    const [customerRes, partnerRes, opsRes] = await Promise.all([
      supabase.from('customers').select('id').eq('auth_id', authId).single(),
      supabase.from('support_partners').select('id').eq('auth_id', authId).single(),
      supabase.from('operations_team').select('id').eq('auth_id', authId).single(),
    ])

    let customerId: string | null = customerRes.data?.id || null
    let partnerId: string | null = partnerRes.data?.id || null

    if (customerRes.data) set({ currentCustomerId: customerRes.data.id })

    const p1 = supabase.from('requests').select('*').order('created_at', { ascending: false })
    const p2 = supabase.from('support_partners').select('*')

    let reqQuery = p1
    if (customerId) reqQuery = supabase.from('requests').select('*').eq('customer_id', customerId).order('created_at', { ascending: false })
    else if (partnerId) {
      const { data: assignments } = await supabase.from('assignments').select('request_id').eq('partner_id', partnerId)
      const reqIds = assignments?.map(a => a.request_id) || []
      reqQuery = supabase.from('requests').select('*').in('id', reqIds.length ? reqIds : ['none']).order('created_at', { ascending: false })
    }

    const [reqRes, partnersRes] = await Promise.all([reqQuery, p2])
    const requests = (reqRes.data || []).map(s2c) as SupportRequest[]
    const allPartners = (partnersRes.data || []).map(s2c) as SupportPartner[]

    const msgMap: Record<string, JourneyMessage[]> = {}
    const assignmentMap: Record<string, any> = {}
    const eventMap: Record<string, OperationEvent[]> = {}

    if (requests.length) {
      const msgRes = await supabase.from('journey_messages').select('*').in('request_id', requests.map(r => r.id)).order('created_at', { ascending: true })
      for (const msg of (msgRes.data || []).map(s2c) as JourneyMessage[]) {
        if (!msgMap[msg.requestId]) msgMap[msg.requestId] = []
        msgMap[msg.requestId].push(msg)
      }

      const assignRes = await supabase.from('assignments').select('*').in('request_id', requests.map(r => r.id))
      for (const a of (assignRes.data || [])) assignmentMap[a.request_id] = s2c(a)

      const eventRes = await supabase.from('journey_events').select('*').in('request_id', requests.map(r => r.id)).order('created_at', { ascending: true })
      for (const ev of (eventRes.data || []).map(s2c) as OperationEvent[]) {
        if (!eventMap[ev.requestId]) eventMap[ev.requestId] = []
        eventMap[ev.requestId].push(ev)
      }
    }

    const reqsWithAssigned = requests.map(r => {
      const a = assignmentMap[r.id]
      return a ? { ...r, assignedPartnerId: a.partnerId, matchId: a.id } : r
    })

    set({
      initialized: true,
      supportRequests: reqsWithAssigned,
      supportPartners: allPartners.length ? allPartners : [...mockPartners],
      journeyMessages: Object.keys(msgMap).length ? msgMap : {},
      operationEvents: eventMap,
    })
  },

  setRequestDraft: (draft) => set((s) => ({ requestDraft: { ...s.requestDraft, ...draft } })),
  resetRequestDraft: () => set({ requestDraft: {} }),

  submitRequest: async () => {
    const draft = get().requestDraft
    if (!draft.category || !draft.meetingLocation || !draft.date || !draft.time) return null

    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: customer } = await supabase.from('customers').select('id').eq('auth_id', user.id).single()
    if (!customer) return null

    const now = new Date().toISOString()
    const { data, error } = await supabase.from('requests').insert({
      customer_id: customer.id,
      category: draft.category,
      title: draft.category.charAt(0).toUpperCase() + draft.category.slice(1),
      meeting_location: draft.meetingLocation,
      destination: draft.destination || null,
      date: draft.date,
      time: draft.time,
      duration: draft.duration || 'under-2',
      description: draft.description || null,
      preferred_gender: draft.genderPreference || 'no-preference',
      special_notes: draft.accessibilityNeeds || null,
      status: 'submitted',
    }).select('id').single()

    if (error || !data) return null
    const newId = data.id

    set((state) => ({
      supportRequests: [{
        id: newId, customerId: customer.id, whoNeedsSupport: draft.whoNeedsSupport || 'me',
        category: draft.category!, meetingLocation: draft.meetingLocation!, destination: draft.destination || '',
        date: draft.date!, time: draft.time!, duration: draft.duration || 'under-2',
        description: draft.description || '', accessibilityNeeds: draft.accessibilityNeeds || '',
        genderPreference: draft.genderPreference || 'no-preference', languagePreference: draft.languagePreference || 'no-preference',
        status: 'submitted', createdAt: now, updatedAt: now,
      } as SupportRequest, ...state.supportRequests],
    }))

    get().resetRequestDraft()
    get().runAiAnalysis(newId)
    return newId
  },

  getRequest: (id) => get().supportRequests.find((r) => r.id === id),
  getCustomer: () => currentCustomer,
  getPartner: (id) => get().supportPartners.find((p) => p.id === id),

  getPartnerByRequest: (requestId) => {
    const req = get().supportRequests.find((r) => r.id === requestId)
    if (!req?.assignedPartnerId) return undefined
    return get().supportPartners.find((p) => p.id === req.assignedPartnerId)
  },

  getMatchByRequest: (requestId) => get().matches.find((m) => m.requestId === requestId),
  getMessagesByRequest: (requestId) => get().journeyMessages[requestId] || [],
  getPaymentByRequest: (requestId) => get().payments.find((p) => p.requestId === requestId),
  getEventsByRequest: (requestId) => get().operationEvents[requestId] || [],
  getIssuesByRequest: (requestId) => get().issues.filter((i) => i.requestId === requestId),

  assignPartner: async (requestId, partnerId) => {
    const supabase = await getSupabase()
    const now = new Date().toISOString()
    const { data, error } = await supabase.from('assignments').insert({
      request_id: requestId, partner_id: partnerId, assigned_by: get().authUserId,
      status: 'assigned',
    }).select('id').single()

    if (!error && data) {
      await supabase.from('requests').update({ status: 'partner-assigned' }).eq('id', requestId)
      await supabase.from('journey_messages').insert([
        { request_id: requestId, sender_type: 'system', sender_name: 'WITHH', content: 'A Support Partner has been assigned.' },
        { request_id: requestId, sender_type: 'system', sender_name: 'WITHH', content: 'Please review the match and confirm to proceed.' },
      ])
    }

    const partner = get().supportPartners.find((p) => p.id === partnerId)
    set((state) => ({
      supportRequests: state.supportRequests.map((r) =>
        r.id === requestId ? { ...r, assignedPartnerId: partnerId, status: 'partner-assigned' as RequestStatus, updatedAt: now } : r
      ),
      matches: [...state.matches, {
        id: data?.id || `match-${Date.now()}`, requestId, partnerId, customerId: get().currentCustomerId,
        status: 'matched' as const, matchedAt: now, reasonForMatch: ['Matches requested preferences'],
        customerApproved: false,
      }],
      journeyMessages: {
        ...state.journeyMessages,
        [requestId]: [
          ...(state.journeyMessages[requestId] || []),
          { id: `msg-${Date.now()}`, requestId, from: 'system' as const, senderName: 'WITHH', content: `${partner?.name || 'A Support Partner'} has been assigned.`, timestamp: now },
          { id: `msg-${Date.now()}-2`, requestId, from: 'system' as const, senderName: 'WITHH', content: 'Please review the match and confirm to proceed.', timestamp: now },
        ],
      },
    }))
  },

  confirmMatch: async (matchId) => {
    const supabase = await getSupabase()
    const now = new Date().toISOString()
    const match = get().matches.find((m) => m.id === matchId)
    if (!match) return
    supabase.from('requests').update({ status: 'confirmed' }).eq('id', match.requestId)
    supabase.from('assignments').update({ status: 'confirmed', accepted_at: now }).eq('request_id', match.requestId)
    supabase.from('journey_messages').insert({
      request_id: match.requestId, sender_type: 'system', sender_name: 'WITHH',
      content: 'You have confirmed the match. Your support journey is set!',
    })

    set((state) => ({
      matches: state.matches.map((m) => m.id === matchId ? { ...m, status: 'confirmed', confirmedAt: now, customerApproved: true } : m),
      supportRequests: state.supportRequests.map((r) => r.id === match.requestId ? { ...r, status: 'confirmed', updatedAt: now } : r),
      journeyMessages: {
        ...state.journeyMessages,
        [match.requestId]: [
          ...(state.journeyMessages[match.requestId] || []),
          { id: `msg-${Date.now()}`, requestId: match.requestId, from: 'system' as const, senderName: 'WITHH', content: 'You have confirmed the match. Your support journey is set!', timestamp: now },
        ],
      },
    }))
  },

  processPayment: async (requestId) => {
    const supabase = await getSupabase()
    const request = get().supportRequests.find((r) => r.id === requestId)
    if (!request) return
    const now = new Date().toISOString()
    supabase.from('requests').update({ status: 'confirmed' }).eq('id', requestId)
    set((state) => ({
      payments: [...state.payments, { id: `pay-${Date.now()}`, requestId, customerId: get().currentCustomerId, amount: 699, baseFee: 699, additionalTimeFee: 0, status: 'completed', createdAt: now, completedAt: now }],
      supportRequests: state.supportRequests.map((r) => r.id === requestId ? { ...r, status: 'confirmed', updatedAt: now } : r),
      journeyMessages: {
        ...state.journeyMessages,
        [requestId]: [...(state.journeyMessages[requestId] || []), { id: `msg-${Date.now()}`, requestId, from: 'system' as const, senderName: 'WITHH', content: 'Payment received. Your support journey is fully confirmed!', timestamp: now }],
      },
    }))
  },

  updateRequestStatus: async (requestId, status) => {
    const supabase = await getSupabase()
    const now = new Date().toISOString()
    supabase.from('requests').update({ status }).eq('id', requestId)
    supabase.from('journey_messages').insert({
      request_id: requestId, sender_type: 'system', sender_name: 'WITHH',
      content: `Status updated to: ${status}`,
    })

    set((state) => ({
      supportRequests: state.supportRequests.map((r) => r.id === requestId ? { ...r, status, updatedAt: now } : r),
      journeyMessages: {
        ...state.journeyMessages,
        [requestId]: [
          ...(state.journeyMessages[requestId] || []),
          { id: `msg-${Date.now()}`, requestId, from: 'system' as const, senderName: 'WITHH', content: `Status updated to: ${status}`, timestamp: now },
        ],
      },
    }))
  },

  addMessage: async (requestId, message) => {
    const supabase = await getSupabase()
    supabase.from('journey_messages').insert({
      request_id: requestId, sender_type: message.from, sender_name: message.senderName, content: message.content,
    })
    set((state) => ({
      journeyMessages: { ...state.journeyMessages, [requestId]: [...(state.journeyMessages[requestId] || []), message] },
    }))
  },

  addIssue: (issue) => set((state) => ({ issues: [...state.issues, issue] })),
  resolveIssue: (issueId, resolution) => {
    const now = new Date().toISOString()
    set((state) => ({ issues: state.issues.map((i) => i.id === issueId ? { ...i, status: 'resolved', resolution, resolvedAt: now } : i) }))
  },
  addEvent: async (requestId, event) => {
    const supabase = await getSupabase()
    supabase.from('journey_events').insert({
      request_id: requestId, event_type: event.type, notes: event.content,
    })
    set((state) => ({ operationEvents: { ...state.operationEvents, [requestId]: [...(state.operationEvents[requestId] || []), event] } }))
  },

  addTicket: (ticket) => set((state) => ({ supportTickets: [...state.supportTickets, ticket] })),
  addTicketMessage: (msg) => set((state) => ({ ticketMessages: [...state.ticketMessages, msg] })),

  aiAnalyses: {},
  aiRecommendations: {},
  aiLoading: false,
  getAiAnalysis: (requestId) => get().aiAnalyses[requestId],
  getAiRecommendation: (requestId) => get().aiRecommendations[requestId],

  runAiAnalysis: async (requestId) => {
    const request = get().supportRequests.find((r) => r.id === requestId)
    if (!request) return
    set({ aiLoading: true })
    const { analyzeRequest } = await import('@/lib/ai-engine')
    const analysis = await analyzeRequest(request)
    set((state) => ({ aiLoading: false, aiAnalyses: { ...state.aiAnalyses, [requestId]: analysis } }))
  },

  runAiMatching: async (requestId) => {
    const request = get().supportRequests.find((r) => r.id === requestId)
    if (!request) return
    set({ aiLoading: true })
    const { generateMatchRecommendation } = await import('@/lib/ai-engine')
    const recommendation = await generateMatchRecommendation(request, get().supportPartners.filter((p) => p.available), [])
    set((state) => ({ aiLoading: false, aiRecommendations: { ...state.aiRecommendations, [requestId]: recommendation } }))
  },

  getAvailablePartners: () => get().supportPartners.filter((p) => p.available),
  getActiveSupports: () => get().supportRequests.filter((r) => ['partner-en-route', 'partner-arrived', 'in-progress'].includes(r.status)),
  getPendingRequests: () => get().supportRequests.filter((r) => ['submitted', 'reviewing'].includes(r.status)),
  getPartnerAssignments: (partnerId) => get().supportRequests.filter((r) => r.assignedPartnerId === partnerId),
  getPartnerEarnings: (partnerId) => get().partnerEarnings.filter((e) => e.partnerId === partnerId),
  getFinanceRecords: () => get().financeRecords,
}))
