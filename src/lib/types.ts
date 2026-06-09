export type SupportCategory = 'hospital' | 'government' | 'appointment' | 'elderly' | 'event' | 'other'

export type SupportDuration = 'under-2' | '2-4' | 'more-4'

export type GenderPreference = 'female' | 'male' | 'no-preference'

export type Language = 'kannada' | 'english' | 'hindi' | 'tamil' | 'telugu' | 'urdu' | 'malayalam'

export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'finding-partner'
  | 'partner-assigned'
  | 'awaiting-customer-confirmation'
  | 'confirmed'
  | 'partner-en-route'
  | 'partner-arrived'
  | 'in-progress'
  | 'completed'
  | 'cancelled'

export type MatchStatus = 'pending' | 'matched' | 'confirmed' | 'rejected'

export type WhoNeedsSupport = 'me' | 'someone-else'

export interface SomeoneElseInfo {
  name: string
  phone: string
  relationship: string
}

export interface SupportRequest {
  id: string
  customerId: string
  whoNeedsSupport: WhoNeedsSupport
  someoneElseInfo?: SomeoneElseInfo
  category: SupportCategory
  otherCategoryDescription?: string
  meetingLocation: string
  destination: string
  date: string
  time: string
  duration: SupportDuration
  description: string
  accessibilityNeeds: string
  genderPreference: GenderPreference
  languagePreference: Language | 'no-preference'
  trustedContact?: {
    name: string
    phone: string
    relationship: string
  }
  status: RequestStatus
  assignedPartnerId?: string
  matchId?: string
  createdAt: string
  updatedAt: string
}

export interface SupportPartner {
  id: string
  name: string
  photo: string
  phone: string
  email: string
  languages: Language[]
  gender: 'male' | 'female'
  completedJourneys: number
  verified: boolean
  bio: string
  specialties: string[]
  available: boolean
  rating: number
  joinedAt: string
  bgCheckStatus?: 'not_submitted' | 'pending' | 'verified' | 'failed'
}

export interface Match {
  id: string
  requestId: string
  partnerId: string
  customerId: string
  status: MatchStatus
  matchedAt: string
  confirmedAt?: string
  reasonForMatch: string[]
  customerApproved: boolean
}

export interface JourneyMessage {
  id: string
  requestId: string
  from: 'system' | 'partner' | 'customer'
  senderName: string
  content: string
  timestamp: string
}

export interface Payment {
  id: string
  requestId: string
  customerId: string
  amount: number
  baseFee: number
  additionalTimeFee: number
  status: 'pending' | 'completed' | 'refunded'
  createdAt: string
  completedAt?: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string
  preferences: {
    genderPreference: GenderPreference
    languagePreference: Language | 'no-preference'
  }
  trustedContacts: {
    name: string
    phone: string
    relationship: string
  }[]
  repeatPartnerIds: string[]
  createdAt: string
}

export interface OperationEvent {
  id: string
  requestId: string
  type: 'note' | 'status-change' | 'issue' | 'resolution' | 'assignment' | 'payment' | 'system'
  content: string
  operatorName: string
  timestamp: string
}

export interface SupportTicket {
  id: string
  userId: string
  subject: string
  issueType: string
  status: 'open' | 'in_progress' | 'resolved'
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  sender: string
  content: string
  timestamp: string
}

export interface Issue {
  id: string
  requestId: string
  type: 'partner-late' | 'customer-no-show' | 'cancellation' | 'safety-concern' | 'payment-issue'
  description: string
  status: 'open' | 'resolved'
  resolvedAt?: string
  resolution?: string
  createdAt: string
}

export interface PartnerEarning {
  id: string
  partnerId: string
  requestId: string
  amount: number
  status: 'pending' | 'paid'
  paidAt?: string
  createdAt: string
}

export interface FinanceRecord {
  id: string
  requestId: string
  customerPayment: number
  partnerPayout: number
  revenue: number
  status: 'completed' | 'refunded'
  createdAt: string
}

export type AiTag =
  | 'hospital-visit'
  | 'elderly-support'
  | 'female-preference'
  | 'male-preference'
  | 'kannada'
  | 'english'
  | 'hindi'
  | 'tamil'
  | 'telugu'
  | 'urdu'
  | 'medical'
  | 'government'
  | 'appointment'
  | 'event-social'
  | 'travel-support'
  | 'tomorrow'
  | 'urgent'
  | 'first-time'
  | 'repeat-customer'
  | 'accessibility'
  | 'anxiety'
  | 'emotional-sensitivity'
  | 'someone-else'

export type AiRiskFlag =
  | 'HIGH_ANXIETY'
  | 'ELDERLY_CUSTOMER'
  | 'ACCESSIBILITY_REQUIRED'
  | 'URGENT_REQUEST'
  | 'FIRST_TIME_CUSTOMER'
  | 'EMOTIONAL_SENSITIVITY'
  | 'SOMEONE_ELSE_INVOLVED'

export interface AiAnalysis {
  requestId: string
  tags: AiTag[]
  classification: SupportCategory
  riskFlags: AiRiskFlag[]
  analyzedAt: string
}

export interface AiPartnerScore {
  partnerId: string
  score: number
  reasons: string[]
}

export interface AiMatchRecommendation {
  requestId: string
  recommended: AiPartnerScore
  alternatives: AiPartnerScore[]
  confidence: number
  generatedAt: string
}

export interface AiProviderConfig {
  provider: 'mock' | 'openai' | 'anthropic' | 'claude' | 'gemini' | 'openrouter'
  apiKey?: string
  model?: string
}
