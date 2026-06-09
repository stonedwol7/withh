import type {
  SupportRequest,
  SupportPartner,
  AiTag,
  AiRiskFlag,
  AiAnalysis,
  AiPartnerScore,
  AiMatchRecommendation,
  AiProviderConfig,
} from './types'
import * as openrouter from './ai-openrouter'

const providerConfig: AiProviderConfig = {
  provider: 'mock',
}

export function configureAi(config: Partial<AiProviderConfig>) {
  Object.assign(providerConfig, config)
}

function mockAnalyzeRequest(request: SupportRequest): AiAnalysis {
  const tags: AiTag[] = []

  const catMap: Record<string, AiTag> = {
    hospital: 'hospital-visit',
    government: 'government',
    appointment: 'appointment',
    elderly: 'elderly-support',
    event: 'event-social',
  }
  if (catMap[request.category]) tags.push(catMap[request.category])

  if (request.genderPreference === 'female') tags.push('female-preference')
  if (request.genderPreference === 'male') tags.push('male-preference')

  const langMap: Record<string, AiTag> = {
    kannada: 'kannada',
    english: 'english',
    hindi: 'hindi',
    tamil: 'tamil',
    telugu: 'telugu',
    urdu: 'urdu',
  }
  if (langMap[request.languagePreference]) tags.push(langMap[request.languagePreference])

  const desc = (request.description || '').toLowerCase()
  if (desc.includes('medical') || desc.includes('doctor') || desc.includes('appointment') || desc.includes('check-up')) {
    if (!tags.includes('medical')) tags.push('medical')
  }
  if (request.whoNeedsSupport === 'someone-else') tags.push('someone-else')
  if (desc.includes('anxious') || desc.includes('nervous') || desc.includes('scared') || desc.includes('worried') || desc.includes('fear')) tags.push('anxiety')
  if (desc.includes('elderly') || desc.includes('mother') || desc.includes('father') || request.category === 'elderly') tags.push('elderly-support')
  if ((request.accessibilityNeeds || '').toLowerCase().includes('wheelchair')) tags.push('accessibility')
  if (desc.includes('urgent') || desc.includes('today') || desc.includes('tomorrow') || desc.includes('asap')) tags.push('urgent')

  const riskFlags: AiRiskFlag[] = []
  if (tags.includes('anxiety')) riskFlags.push('HIGH_ANXIETY')
  if (request.category === 'elderly' || tags.includes('elderly-support')) riskFlags.push('ELDERLY_CUSTOMER')
  if (tags.includes('accessibility')) riskFlags.push('ACCESSIBILITY_REQUIRED')
  if (tags.includes('urgent')) riskFlags.push('URGENT_REQUEST')
  if (tags.includes('someone-else')) riskFlags.push('SOMEONE_ELSE_INVOLVED')
  if (desc.includes('first time') || desc.includes('never done') || desc.includes('alone')) riskFlags.push('FIRST_TIME_CUSTOMER')
  if (tags.includes('anxiety') && !riskFlags.includes('HIGH_ANXIETY')) riskFlags.push('EMOTIONAL_SENSITIVITY')

  return { requestId: request.id, tags, classification: request.category, riskFlags, analyzedAt: new Date().toISOString() }
}

function mockScorePartner(request: SupportRequest, partner: SupportPartner, isRepeat: boolean): AiPartnerScore {
  let score = 0
  const reasons: string[] = []
  if (partner.available) { score += 25; reasons.push('✓ Available') }
  if (request.genderPreference === 'no-preference') { score += 10 }
  else if (partner.gender === request.genderPreference) { score += 15; reasons.push(`✓ ${request.genderPreference === 'female' ? 'Female' : 'Male'} match`) }
  const prefLang = request.languagePreference
  if (prefLang !== 'no-preference' && partner.languages.includes(prefLang)) { score += 15; reasons.push(`✓ ${prefLang.charAt(0).toUpperCase() + prefLang.slice(1)} speaker`) }
  if (partner.specialties.some((s) => s.toLowerCase().includes(request.category))) { score += 15; reasons.push('✓ Relevant experience') }
  if (partner.completedJourneys > 100) { score += 10; reasons.push('✓ Highly experienced') }
  else if (partner.completedJourneys > 50) { score += 5 }
  if (isRepeat) { score += 15; reasons.push('✓ Previously accompanied this customer') }
  if (partner.rating >= 4.8) { score += 5 }
  score = Math.min(score, 100)
  return { partnerId: partner.id, score, reasons }
}

export async function analyzeRequest(request: SupportRequest): Promise<AiAnalysis> {
  if (providerConfig.provider === 'openrouter') {
    try { return await openrouter.analyzeRequest(request) }
    catch { return mockAnalyzeRequest(request) }
  }
  return mockAnalyzeRequest(request)
}

export async function generateMatchRecommendation(
  request: SupportRequest, partners: SupportPartner[], repeatPartnerIds: string[]
): Promise<AiMatchRecommendation> {
  if (providerConfig.provider === 'openrouter') {
    try { return await openrouter.generateMatchRecommendation(request, partners, repeatPartnerIds) }
    catch {}
  }

  const scored = partners.filter((p) => p.available).map((p) => mockScorePartner(request, p, repeatPartnerIds.includes(p.id))).sort((a, b) => b.score - a.score)
  const [recommended, ...alternatives] = scored
  return {
    requestId: request.id,
    recommended: recommended || { partnerId: '', score: 0, reasons: [] },
    alternatives: alternatives.slice(0, 3),
    confidence: recommended ? Math.round(recommended.score / 100 * 85 + 10) : 0,
    generatedAt: new Date().toISOString(),
  }
}

export const riskFlagLabels: Record<AiRiskFlag, { label: string; color: string; icon: string }> = {
  HIGH_ANXIETY: { label: 'High Anxiety', color: 'bg-red/5 text-red border-red/20', icon: '😰' },
  ELDERLY_CUSTOMER: { label: 'Elderly Customer', color: 'bg-amber/5 text-amber border-amber/20', icon: '👴' },
  ACCESSIBILITY_REQUIRED: { label: 'Accessibility Required', color: 'bg-purple/5 text-purple border-purple/20', icon: '♿' },
  URGENT_REQUEST: { label: 'Urgent Request', color: 'bg-red/5 text-red border-red/20', icon: '⚡' },
  FIRST_TIME_CUSTOMER: { label: 'First-Time Customer', color: 'bg-blue/5 text-blue border-blue/20', icon: '🆕' },
  EMOTIONAL_SENSITIVITY: { label: 'Emotional Sensitivity', color: 'bg-pink/5 text-pink border-pink/20', icon: '💗' },
  SOMEONE_ELSE_INVOLVED: { label: 'Someone Else Involved', color: 'bg-teal/5 text-teal border-teal/20', icon: '👥' },
}

export const tagLabels: Record<AiTag, string> = {
  'hospital-visit': 'Hospital Visit', 'elderly-support': 'Elderly Support',
  'female-preference': 'Female Preference', 'male-preference': 'Male Preference',
  kannada: 'Kannada', english: 'English', hindi: 'Hindi', tamil: 'Tamil',
  telugu: 'Telugu', urdu: 'Urdu', medical: 'Medical', government: 'Government',
  appointment: 'Appointment', 'event-social': 'Event & Social', 'travel-support': 'Travel Support',
  tomorrow: 'Tomorrow', urgent: 'Urgent', 'first-time': 'First-Time',
  'repeat-customer': 'Repeat Customer', accessibility: 'Accessibility',
  anxiety: 'Anxiety', 'emotional-sensitivity': 'Emotional Sensitivity', 'someone-else': 'Someone Else',
}
