export type SupportCategory = string
export type SupportDuration = string
export type GenderPreference = 'no_preference' | 'no-preference' | 'male' | 'female'
export type Language = string
export type WhoNeedsSupport = 'self' | 'family' | 'friend' | 'someone-else'

export interface SupportRequest {
  id: string
  customerId: string
  category: SupportCategory
  principalName: string
  exactMeetingSpot: string
  scheduledAt: string
  durationEstimateMinutes: number
  requiresFemalePartner: boolean
  genderPreference: GenderPreference
  languagePreference: Language
  whoNeedsSupport: WhoNeedsSupport
  language: Language
  description?: string
  duration?: string
  date?: string
  time?: string
  accessibilityNeeds?: string
  trustedContactName?: string
  trustedContactPhone?: string
  status: string
  totalPrice: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SupportPartner {
  id: string
  name: string
  phone: string
  email: string
  categories: SupportCategory[]
  languages: Language[]
  rating: number
  totalRatings: number
  completedMissions: number
  completedJourneys: number
  bio: string
  videoUrl?: string
  isGuarantorVerified: boolean
  backgroundCheckStatus: string
  hourlyRate: number
  availabilityStatus: string
  available: boolean
  gender: string
  specialties: string[]
  createdAt: string
}

export type AiTag = { name: string; confidence: number } | string

export type AiRiskFlag = { type: string; severity: 'low' | 'medium' | 'high'; description: string } | string

export type AiAnalysis = {
  category: string
  sentiment: string
  urgency: 'low' | 'medium' | 'high'
  tags: AiTag[]
  riskFlags: AiRiskFlag[]
  summary: string
  requestId?: string
  classification?: string
  analyzedAt?: string
} | {
  requestId: string
  tags: AiTag[]
  classification: string
  riskFlags: AiRiskFlag[]
  analyzedAt: string
}

export type AiPartnerScore = {
  partnerId: string
  score: number
  reasoning: string
  strengths: string[]
  concerns: string[]
} | {
  partnerId: string
  score: number
  reasons: string[]
}

export type AiMatchRecommendation = {
  requestId: string
  rankedPartnerIds: string[]
  reasoning: string
  analysis: AiAnalysis
} | {
  requestId: string
  recommended: { partnerId: string; score: number; reasons: string[] }
  alternatives: { partnerId: string; score: number; reasons: string[] }[]
  confidence: number
  generatedAt: string
}

export interface AiProviderConfig {
  provider: 'mock' | 'openrouter' | 'ollama' | 'openai' | 'anthropic'
  model?: string
  apiKey?: string
  baseUrl?: string
}
