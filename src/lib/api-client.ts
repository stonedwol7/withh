const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API Error: ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Auth
  login: (role: string, userName: string) =>
    request<{ session: { id: string; role: string; userName: string; createdAt: string } }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ role, userName }),
    }),
  logout: (sessionId: string) =>
    request<{ success: boolean }>('/auth/logout', {
      method: 'POST', body: JSON.stringify({ sessionId }),
    }),
  getSession: (id: string) => request<any>(`/auth/session/${id}`),

  // Support Requests
  getRequests: (customerId?: string) =>
    request<any[]>(`/requests${customerId ? `?customerId=${customerId}` : ''}`),
  getRequest: (id: string) => request<any>(`/requests/${id}`),
  createRequest: (data: any) =>
    request<any>('/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateRequest: (id: string, data: any) =>
    request<any>(`/requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Partners
  getPartners: (availableOnly = false) =>
    request<any[]>(`/partners${availableOnly ? '?available=true' : ''}`),
  getPartner: (id: string) => request<any>(`/partners/${id}`),

  // Matching
  getMatches: (requestId: string) => request<any[]>(`/matching/${requestId}`),
  confirmMatch: (requestId: string, matchId: string) =>
    request<any>(`/matching/${requestId}/confirm`, { method: 'POST', body: JSON.stringify({ matchId }) }),
  generateMatches: (requestId: string) =>
    request<any>(`/matching/generate/${requestId}`, { method: 'POST' }),

  // Payments
  getPayments: (requestId: string) => request<any[]>(`/payments/${requestId}`),

  // Messages
  getMessages: (requestId: string) => request<any[]>(`/messages/${requestId}`),
  sendMessage: (requestId: string, data: { fromType: string; senderName: string; content: string }) =>
    request<any>(`/messages/${requestId}`, { method: 'POST', body: JSON.stringify(data) }),

  // Issues
  getIssues: () => request<any[]>('/issues'),
  createIssue: (data: { requestId: string; type: string; description: string }) =>
    request<any>('/issues', { method: 'POST', body: JSON.stringify(data) }),
  resolveIssue: (id: string, resolution: string) =>
    request<any>(`/issues/${id}/resolve`, { method: 'PATCH', body: JSON.stringify({ resolution }) }),

  // Ops Data
  getOpsEvents: (requestId?: string) =>
    request<any[]>(`/ops${requestId ? `/${requestId}` : ''}`),
  getDashboardStats: () => request<any>('/ops/dashboard/stats'),
  getActiveSupports: () => request<any[]>('/ops/active-supports'),
  getFinanceRecords: () => request<any[]>('/ops/finance/records'),
  getPartnerEarnings: (partnerId: string) => request<any[]>(`/ops/earnings/${partnerId}`),

  // AI
  getAiAnalysis: (requestId: string) => request<any>(`/ops/ai/${requestId}`),

  // Refunds
  getRefunds: (requestId: string) => request<any[]>(`/refunds/${requestId}`),
  createRefund: (data: { requestId: string; customerId: string; amount: number; reason: string }) =>
    request<any>('/refunds', { method: 'POST', body: JSON.stringify(data) }),
  approveRefund: (id: string, approvedBy: string) =>
    request<any>(`/refunds/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ approvedBy }) }),
  rejectRefund: (id: string) =>
    request<any>(`/refunds/${id}/reject`, { method: 'PATCH' }),

  // Availability
  getAvailability: (partnerId: string) => request<any[]>(`/availability/${partnerId}`),
  createAvailabilitySlot: (partnerId: string, data: any) =>
    request<any>(`/availability/${partnerId}`, { method: 'POST', body: JSON.stringify(data) }),
  deleteAvailabilitySlot: (slotId: string) =>
    request<any>(`/availability/${slotId}`, { method: 'DELETE' }),

  // Referrals
  getReferrals: (referrerId: string) => request<any[]>(`/referrals/${referrerId}`),
  createReferral: (data: { referrerId: string; referrerRole: string; referredEmail?: string; referredPhone?: string }) =>
    request<any>('/referrals', { method: 'POST', body: JSON.stringify(data) }),
  claimReferral: (code: string) =>
    request<any>('/referrals/claim', { method: 'POST', body: JSON.stringify({ code }) }),

  // Recurring Bookings
  getCustomerRecurring: (customerId: string) => request<any[]>(`/recurring/customer/${customerId}`),
  getPartnerRecurring: (partnerId: string) => request<any[]>(`/recurring/partner/${partnerId}`),
  createRecurringBooking: (data: any) =>
    request<any>('/recurring', { method: 'POST', body: JSON.stringify(data) }),
  toggleRecurringBooking: (id: string) =>
    request<any>(`/recurring/${id}/toggle`, { method: 'PATCH' }),

  // Wallet
  getWallet: (customerId: string) => request<{ transactions: any[]; balance: number }>(`/wallet/${customerId}`),
  topUpWallet: (customerId: string, amount: number, description?: string) =>
    request<any>(`/wallet/${customerId}/topup`, { method: 'POST', body: JSON.stringify({ amount, description }) }),
  debitWallet: (customerId: string, amount: number, description?: string, referenceId?: string) =>
    request<any>(`/wallet/${customerId}/debit`, { method: 'POST', body: JSON.stringify({ amount, description, referenceId }) }),

  // AI Feedback
  getAiFeedback: (requestId: string) => request<any[]>(`/ai-feedback/${requestId}`),
  submitAiFeedback: (data: { requestId: string; feedbackType: string; rating?: number; correct?: boolean; notes?: string }) =>
    request<any>('/ai-feedback', { method: 'POST', body: JSON.stringify(data) }),
  getAiAccuracy: () => request<{ total: number; correct: number; accuracy: number }>('/ai-feedback/stats/accuracy'),

  // Promo Codes
  getPromoCodes: () => request<any[]>('/promocodes'),
  createPromoCode: (data: any) =>
    request<any>('/promocodes', { method: 'POST', body: JSON.stringify(data) }),
  validatePromoCode: (code: string, amount: number) =>
    request<any>('/promocodes/validate', { method: 'POST', body: JSON.stringify({ code, amount }) }),

  // Ops Users
  getOpsUsers: () => request<any[]>('/ops-users'),
  createOpsUser: (data: { name: string; email: string; role?: string; permissions?: string[] }) =>
    request<any>('/ops-users', { method: 'POST', body: JSON.stringify(data) }),
  deactivateOpsUser: (id: string) =>
    request<any>(`/ops-users/${id}/deactivate`, { method: 'PATCH' }),
}
