import { create } from 'zustand'
import type {
  SupportRequest,
  SupportPartner,
  Match,
  JourneyMessage,
  Payment,
  Issue,
  SupportCategory,
  SupportDuration,
  GenderPreference,
  Language,
  WhoNeedsSupport,
  RequestStatus,
  PartnerEarning,
  FinanceRecord,
  OperationEvent,
  AiAnalysis,
  AiMatchRecommendation,
  SupportTicket,
  TicketMessage,
} from '@/lib/types'
import {
  currentCustomer,
  supportPartners as mockPartners,
  supportRequests as mockRequests,
  matches as mockMatches,
  journeyMessages as mockMessages,
  payments as mockPayments,
  operationEvents as mockEvents,
  issues as mockIssues,
  partnerEarnings as mockEarnings,
  financeRecords as mockFinance,
} from '@/lib/mock-data'

interface RequestDraft {
  whoNeedsSupport?: WhoNeedsSupport
  someoneElseName?: string
  someoneElsePhone?: string
  someoneElseRelationship?: string
  category?: SupportCategory
  otherCategoryDescription?: string
  meetingLocation?: string
  destination?: string
  date?: string
  time?: string
  duration?: SupportDuration
  description?: string
  accessibilityNeeds?: string
  genderPreference?: GenderPreference
  languagePreference?: Language | 'no-preference'
  trustedContactName?: string
  trustedContactPhone?: string
  trustedContactRelationship?: string
}

interface AppState {
  initialized: boolean
  currentCustomerId: string
  supportRequests: SupportRequest[]
  supportPartners: SupportPartner[]
  matches: Match[]
  journeyMessages: Record<string, JourneyMessage[]>
  payments: Payment[]
  operationEvents: Record<string, OperationEvent[]>
  issues: Issue[]
  partnerEarnings: PartnerEarning[]
  financeRecords: FinanceRecord[]
  supportTickets: SupportTicket[]
  ticketMessages: TicketMessage[]

  requestDraft: RequestDraft

  initialize: () => Promise<void>
  setRequestDraft: (draft: Partial<RequestDraft>) => void
  resetRequestDraft: () => void
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
  addIssue: (issue: Issue) => void
  resolveIssue: (issueId: string, resolution: string) => void
  addEvent: (requestId: string, event: OperationEvent) => void

  getAvailablePartners: () => SupportPartner[]
  getActiveSupports: () => SupportRequest[]
  getPendingRequests: () => SupportRequest[]
  getPartnerAssignments: (partnerId: string) => SupportRequest[]
  getPartnerEarnings: (partnerId: string) => PartnerEarning[]
  getFinanceRecords: () => FinanceRecord[]
  addTicket: (ticket: SupportTicket) => void
  addTicketMessage: (msg: TicketMessage) => void

  aiAnalyses: Record<string, AiAnalysis>
  aiRecommendations: Record<string, AiMatchRecommendation>
  aiLoading: boolean
  runAiAnalysis: (requestId: string) => Promise<void>
  runAiMatching: (requestId: string) => Promise<void>
  getAiAnalysis: (requestId: string) => AiAnalysis | undefined
  getAiRecommendation: (requestId: string) => AiMatchRecommendation | undefined
}

let requestCounter = 3
let matchCounter = 1
let paymentCounter = 1
let issueCounter = 0
let earningCounter = 1
let financeCounter = 1
let eventCounter = 4

function canUseApi() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

function canUseBackend() {
  return process.env.NEXT_PUBLIC_USE_LOCAL_BACKEND === 'true'
}

async function apiGet<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function apiPost<T>(url: string, body?: any): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

function uniqueById<T extends { id: string }>(arr: T[]): T[] {
  const seen = new Set<string>()
  return arr.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

export const useAppStore = create<AppState>((set, get) => ({
  initialized: false,
  currentCustomerId: 'cust-1',
  supportRequests: [...mockRequests],
  supportPartners: [...mockPartners],
  matches: [...mockMatches],
  journeyMessages: JSON.parse(JSON.stringify(mockMessages)),
  payments: [...mockPayments],
  operationEvents: JSON.parse(JSON.stringify(mockEvents)),
  issues: [...mockIssues],
  partnerEarnings: [...mockEarnings],
  financeRecords: [...mockFinance],
  supportTickets: [],
  ticketMessages: [],

  requestDraft: {},

  initialize: async () => {
    if (get().initialized) return

    if (canUseBackend()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        const { arraySnakeToCamel } = await import('@/lib/mapper')
        const res = await fetch(`${apiUrl}/requests`)
        if (res.ok) {
          const raw = await res.json()
          const requests = arraySnakeToCamel<SupportRequest>(raw)
          const partnersRes = await fetch(`${apiUrl}/partners`)
          const partners = partnersRes.ok ? arraySnakeToCamel<SupportPartner>(await partnersRes.json()) : [...mockPartners]

          const msgMap: Record<string, JourneyMessage[]> = {}
          for (const r of requests) {
            const msgsRes = await fetch(`${apiUrl}/messages?requestId=${r.id}`)
            if (msgsRes.ok) {
              msgMap[r.id] = arraySnakeToCamel<JourneyMessage>(await msgsRes.json())
            }
          }

          set({
            initialized: true,
            supportRequests: uniqueById(requests),
            supportPartners: partners,
            journeyMessages: msgMap,
          })
          return
        }
      } catch {}

      if (!canUseApi()) {
        set({ initialized: true })
        return
      }
    }

    if (!canUseApi()) {
      set({ initialized: true })
      return
    }
    try {
      const [requests, partners] = await Promise.all([
        apiGet<SupportRequest[]>('/api/requests'),
        apiGet<SupportPartner[]>('/api/partners'),
      ])
      if (requests) {
        const msgMap: Record<string, JourneyMessage[]> = {}
        const payArr: Payment[] = []
        const eventMap: Record<string, OperationEvent[]> = {}
        const matchArr: Match[] = []

        for (const r of requests) {
          const msgs = await apiGet<JourneyMessage[]>(`/api/messages?requestId=${r.id}`)
          if (msgs) msgMap[r.id] = msgs
        }

        set({
          initialized: true,
          supportRequests: uniqueById(requests),
          supportPartners: partners || [...mockPartners],
          journeyMessages: msgMap,
          payments: payArr,
          operationEvents: eventMap,
          matches: matchArr,
        })
        return
      }
    } catch {}
    set({ initialized: true })
  },

  setRequestDraft: (draft) =>
    set((state) => ({ requestDraft: { ...state.requestDraft, ...draft } })),

  resetRequestDraft: () => set({ requestDraft: {} }),

  submitRequest: async () => {
    const draft = get().requestDraft
    if (!draft.category || !draft.meetingLocation || !draft.date || !draft.time) return null

    requestCounter++
    const id = `req-${requestCounter}`
    const now = new Date().toISOString()

    if (canUseBackend()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        const { camelToSnake } = await import('@/lib/mapper')
        const res = await fetch(`${apiUrl}/requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(camelToSnake({
            id,
            customerId: get().currentCustomerId,
            whoNeedsSupport: draft.whoNeedsSupport,
            category: draft.category,
            meetingLocation: draft.meetingLocation,
            destination: draft.destination,
            date: draft.date,
            time: draft.time,
            duration: draft.duration,
            description: draft.description,
            accessibilityNeeds: draft.accessibilityNeeds,
            genderPreference: draft.genderPreference,
            languagePreference: draft.languagePreference,
            status: 'submitted',
            createdAt: now,
            updatedAt: now,
          })),
        })
        if (res.ok) {
          const created = await res.json()
          get().resetRequestDraft()
          return created.id || id
        }
      } catch {}
    }

    if (canUseApi()) {
      const created = await apiPost<any>('/api/requests', {
        category: draft.category,
        title: draft.category.charAt(0).toUpperCase() + draft.category.slice(1),
        description: draft.description || '',
        meeting_location: draft.meetingLocation,
        destination: draft.destination,
        date: draft.date,
        time: draft.time,
        duration: draft.duration || 'under-2 hours',
        preferred_gender: draft.genderPreference || 'no-preference',
        special_notes: draft.accessibilityNeeds || '',
      })
      if (created) {
        set((state) => ({
          supportRequests: [created, ...state.supportRequests],
        }))
        get().resetRequestDraft()
        return created.id
      }
    }

    const request: SupportRequest = {
      id,
      customerId: 'cust-1',
      whoNeedsSupport: draft.whoNeedsSupport || 'me',
      someoneElseInfo: draft.whoNeedsSupport === 'someone-else' ? {
        name: draft.someoneElseName || '',
        phone: draft.someoneElsePhone || '',
        relationship: draft.someoneElseRelationship || '',
      } : undefined,
      category: draft.category,
      otherCategoryDescription: draft.otherCategoryDescription,
      meetingLocation: draft.meetingLocation || '',
      destination: draft.destination || '',
      date: draft.date,
      time: draft.time,
      duration: draft.duration || 'under-2',
      description: draft.description || '',
      accessibilityNeeds: draft.accessibilityNeeds || '',
      genderPreference: draft.genderPreference || 'no-preference',
      languagePreference: draft.languagePreference || 'no-preference',
      trustedContact: draft.trustedContactName ? { name: draft.trustedContactName, phone: draft.trustedContactPhone || '', relationship: draft.trustedContactRelationship || '' } : undefined,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    }

    set((state) => ({
      supportRequests: [request, ...state.supportRequests],
      journeyMessages: {
        ...state.journeyMessages,
        [id]: [
          { id: `msg-${Date.now()}-1`, requestId: id, from: 'system', senderName: 'WITHH', content: 'Your support request has been received.', timestamp: now },
          { id: `msg-${Date.now()}-2`, requestId: id, from: 'system', senderName: 'WITHH', content: 'We are reviewing your request and finding the right Support Partner.', timestamp: now },
        ],
      },
      operationEvents: {
        ...state.operationEvents,
        [id]: [{ id: `oe-${eventCounter++}`, requestId: id, type: 'status-change', content: 'Request submitted by customer. Pending review.', operatorName: 'System', timestamp: now }],
      },
    }))

    get().resetRequestDraft()
    get().runAiAnalysis(id)
    return id
  },

  getRequest: (id) => get().supportRequests.find((r) => r.id === id),
  getCustomer: () => currentCustomer,
  getPartner: (id) => get().supportPartners.find((p) => p.id === id),

  getPartnerByRequest: (requestId) => {
    const req = get().supportRequests.find((r) => r.id === requestId)
    if (!req?.assignedPartnerId) return undefined
    return get().supportPartners.find((p) => p.id === req.assignedPartnerId)
  },

  getMatchByRequest: (requestId) =>
    get().matches.find((m) => m.requestId === requestId),

  getMessagesByRequest: (requestId) =>
    get().journeyMessages[requestId] || [],

  getPaymentByRequest: (requestId) =>
    get().payments.find((p) => p.requestId === requestId),

  getEventsByRequest: (requestId) =>
    get().operationEvents[requestId] || [],

  getIssuesByRequest: (requestId) =>
    get().issues.filter((i) => i.requestId === requestId),

  assignPartner: async (requestId, partnerId) => {
    const partner = get().supportPartners.find((p) => p.id === partnerId)
    matchCounter++
    const matchId = `match-${matchCounter}`
    const now = new Date().toISOString()

    if (canUseBackend()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        await fetch(`${apiUrl}/requests/${requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'partner-assigned', assigned_partner_id: partnerId }),
        })
      } catch {}
    }

    set((state) => ({
      supportRequests: state.supportRequests.map((r) =>
        r.id === requestId ? { ...r, assignedPartnerId: partnerId, status: 'partner-assigned', matchId, updatedAt: now } : r
      ),
      matches: [...state.matches, {
        id: matchId, requestId, partnerId, customerId: 'cust-1', status: 'matched', matchedAt: now,
        reasonForMatch: ['Matches requested preferences', 'Available on requested date'],
        customerApproved: false,
      }],
      journeyMessages: {
        ...state.journeyMessages,
        [requestId]: [
          ...(state.journeyMessages[requestId] || []),
          { id: `msg-${Date.now()}`, requestId, from: 'system', senderName: 'WITHH', content: `${partner?.name || 'A Support Partner'} has been assigned.`, timestamp: now },
          { id: `msg-${Date.now()}-2`, requestId, from: 'system', senderName: 'WITHH', content: 'Please review the match and confirm to proceed.', timestamp: now },
        ],
      },
      operationEvents: {
        ...state.operationEvents,
        [requestId]: [
          ...(state.operationEvents[requestId] || []),
          { id: `oe-${eventCounter++}`, requestId, type: 'status-change', content: `${partner?.name} assigned.`, operatorName: 'System', timestamp: now },
        ],
      },
    }))
  },

  confirmMatch: (matchId) => {
    const now = new Date().toISOString()
    const match = get().matches.find((m) => m.id === matchId)
    if (!match) return

    if (canUseBackend()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        fetch(`${apiUrl}/requests/${match.requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'confirmed' }),
        })
      } catch {}
    }

    set((state) => ({
      matches: state.matches.map((m) => m.id === matchId ? { ...m, status: 'confirmed', confirmedAt: now, customerApproved: true } : m),
      supportRequests: state.supportRequests.map((r) => r.id === match.requestId ? { ...r, status: 'confirmed', updatedAt: now } : r),
      journeyMessages: {
        ...state.journeyMessages,
        [match.requestId]: [
          ...(state.journeyMessages[match.requestId] || []),
          { id: `msg-${Date.now()}`, requestId: match.requestId, from: 'system', senderName: 'WITHH', content: 'You have confirmed the match. Your support journey is set!', timestamp: now },
        ],
      },
      operationEvents: {
        ...state.operationEvents,
        [match.requestId]: [
          ...(state.operationEvents[match.requestId] || []),
          { id: `oe-${eventCounter++}`, requestId: match.requestId, type: 'status-change', content: 'Customer confirmed the match.', operatorName: 'System', timestamp: now },
        ],
      },
    }))
  },

  processPayment: (requestId) => {
    const request = get().supportRequests.find((r) => r.id === requestId)
    if (!request) return
    paymentCounter++
    const now = new Date().toISOString()
    const amount = 699

    if (canUseBackend()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        fetch(`${apiUrl}/payments/${requestId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId: 'cust-1', amount, baseFee: amount, additionalTimeFee: 0 }),
        })
      } catch {}
    }

    set((state) => ({
      payments: [...state.payments, { id: `pay-${paymentCounter}`, requestId, customerId: 'cust-1', amount, baseFee: amount, additionalTimeFee: 0, status: 'completed', createdAt: now, completedAt: now }],
      supportRequests: state.supportRequests.map((r) => r.id === requestId ? { ...r, status: 'confirmed', updatedAt: now } : r),
      journeyMessages: {
        ...state.journeyMessages,
        [requestId]: [...(state.journeyMessages[requestId] || []), { id: `msg-${Date.now()}`, requestId, from: 'system', senderName: 'WITHH', content: 'Payment received. Your support journey is fully confirmed!', timestamp: now }],
      },
      operationEvents: {
        ...state.operationEvents,
        [requestId]: [...(state.operationEvents[requestId] || []), { id: `oe-${eventCounter++}`, requestId, type: 'status-change', content: `Payment of $${amount} received.`, operatorName: 'System', timestamp: now }],
      },
    }))
  },

  updateRequestStatus: (requestId, status) => {
    const now = new Date().toISOString()
    const partner = get().getPartnerByRequest(requestId)

    if (canUseBackend()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        fetch(`${apiUrl}/requests/${requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
      } catch {}
    }

    set((state) => ({
      supportRequests: state.supportRequests.map((r) => r.id === requestId ? { ...r, status, updatedAt: now } : r),
      journeyMessages: {
        ...state.journeyMessages,
        [requestId]: [
          ...(state.journeyMessages[requestId] || []),
          { id: `msg-${Date.now()}`, requestId, from: 'system', senderName: 'WITHH', content: status === 'partner-en-route' ? `${partner?.name || 'Your partner'} is on the way.` : status === 'partner-arrived' ? `${partner?.name || 'Your partner'} has arrived.` : status === 'in-progress' ? 'Support journey is in progress.' : status === 'completed' ? 'Support journey completed. Thank you for choosing WITHH.' : `Status updated to ${status}.`, timestamp: now },
        ],
      },
      operationEvents: {
        ...state.operationEvents,
        [requestId]: [
          ...(state.operationEvents[requestId] || []),
          { id: `oe-${eventCounter++}`, requestId, type: 'status-change', content: `Status changed to: ${status}`, operatorName: 'System', timestamp: now },
        ],
      },
    }))

    if (status === 'completed') {
      const request = get().supportRequests.find((r) => r.id === requestId)
      if (request?.assignedPartnerId) {
        earningCounter++
        set((state) => ({
          partnerEarnings: [...state.partnerEarnings, { id: `earn-${earningCounter}`, partnerId: request.assignedPartnerId!, requestId, amount: 499, status: 'pending', createdAt: now }],
          financeRecords: [...state.financeRecords, { id: `fin-${financeCounter++}`, requestId, customerPayment: 899, partnerPayout: 499, revenue: 400, status: 'completed', createdAt: now }],
        }))
      }
    }
  },

  addMessage: (requestId, message) => {
    if (canUseBackend()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        fetch(`${apiUrl}/messages/${requestId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromType: message.from, senderName: message.senderName, content: message.content }),
        })
      } catch {}
    }

    set((state) => ({
      journeyMessages: {
        ...state.journeyMessages,
        [requestId]: [...(state.journeyMessages[requestId] || []), message],
      },
    }))
  },

  addIssue: (issue) => {
    if (canUseBackend()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        fetch(`${apiUrl}/issues`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(issue),
        })
      } catch {}
    }
    set((state) => ({ issues: [...state.issues, issue] }))
  },

  resolveIssue: (issueId, resolution) => {
    const now = new Date().toISOString()
    if (canUseBackend()) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        fetch(`${apiUrl}/issues/${issueId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolution }),
        })
      } catch {}
    }
    set((state) => ({
      issues: state.issues.map((i) => i.id === issueId ? { ...i, status: 'resolved', resolution, resolvedAt: now } : i),
    }))
  },

  addEvent: (requestId, event) => {
    set((state) => ({
      operationEvents: {
        ...state.operationEvents,
        [requestId]: [...(state.operationEvents[requestId] || []), event],
      },
    }))
  },

  addTicket: (ticket) => {
    set((state) => ({ supportTickets: [...state.supportTickets, ticket] }))
  },

  addTicketMessage: (msg) => {
    set((state) => ({ ticketMessages: [...state.ticketMessages, msg] }))
  },

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
