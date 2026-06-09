import type { SupportRequest, SupportPartner, AiAnalysis, AiMatchRecommendation, AiPartnerScore, AiTag, AiRiskFlag } from './types'

function buildAnalysisPrompt(request: SupportRequest): string {
  return `Analyze this support request and return JSON with:
- tags: array of tags from: hospital-visit, government, appointment, elderly-support, event-social, medical, anxiety, urgent, first-time, accessibility, someone-else, female-preference, male-preference, kannada, english, hindi, tamil, telugu, urdu, malayalam
- classification: one of: hospital, government, appointment, elderly, event, other
- riskFlags: array from: HIGH_ANXIETY, ELDERLY_CUSTOMER, ACCESSIBILITY_REQUIRED, URGENT_REQUEST, FIRST_TIME_CUSTOMER, EMOTIONAL_SENSITIVITY, SOMEONE_ELSE_INVOLVED
- reasoning: brief explanation

Request details:
Category: ${request.category}
Description: ${request.description || 'N/A'}
Accessibility needs: ${request.accessibilityNeeds || 'N/A'}
Who needs support: ${request.whoNeedsSupport || 'me'}
Language preference: ${request.languagePreference || 'none'}
Gender preference: ${request.genderPreference || 'none'}
Duration: ${request.duration || 'N/A'}

Respond ONLY with valid JSON.`
}

function buildMatchPrompt(request: SupportRequest, partners: SupportPartner[], repeatIds: string[]): string {
  const partnersJson = partners.map(p => ({
    id: p.id,
    name: p.name,
    gender: p.gender,
    languages: p.languages,
    specialties: p.specialties,
    rating: p.rating,
    completedJourneys: p.completedJourneys,
    available: p.available,
    isRepeat: repeatIds.includes(p.id),
  }))

  return `Given this support request and available partners, score each partner 0-100 and recommend the best match. Return JSON:
{
  "recommended": { "partnerId": string, "score": number, "reasons": string[] },
  "alternatives": [{ "partnerId": string, "score": number, "reasons": string[] }],
  "confidence": number (0-100),
  "reasoning": string
}

Request: ${request.category} on ${request.date} at ${request.time}
Duration: ${request.duration}
Language preference: ${request.languagePreference || 'any'}
Gender preference: ${request.genderPreference || 'any'}

Available partners: ${JSON.stringify(partnersJson)}

Consider: language match, gender preference, experience, specialties, repeat customer history, availability. Respond ONLY with valid JSON.`
}

async function callAi(messages: { role: string; content: string }[]): Promise<string | null> {
  try {
    const res = await fetch('/api/ai/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, responseFormat: 'json' }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.choices?.[0]?.message?.content || null
  } catch { return null }
}

export async function analyzeRequest(request: SupportRequest): Promise<AiAnalysis> {
  const prompt = buildAnalysisPrompt(request)
  const content = await callAi([{ role: 'user', content: prompt }])

  if (!content) throw new Error('AI analysis failed')

  try {
    const parsed = JSON.parse(content)
    return {
      requestId: request.id,
      tags: parsed.tags || [],
      classification: parsed.classification || request.category,
      riskFlags: parsed.riskFlags || [],
      analyzedAt: new Date().toISOString(),
    }
  } catch {
    throw new Error('Failed to parse AI response')
  }
}

export async function generateMatchRecommendation(
  request: SupportRequest,
  partners: SupportPartner[],
  repeatPartnerIds: string[]
): Promise<AiMatchRecommendation> {
  const prompt = buildMatchPrompt(request, partners.filter(p => p.available), repeatPartnerIds)
  const content = await callAi([{ role: 'user', content: prompt }])

  if (!content) throw new Error('AI matching failed')

  try {
    const parsed = JSON.parse(content)
    return {
      requestId: request.id,
      recommended: parsed.recommended || { partnerId: '', score: 0, reasons: ['No suitable match'] },
      alternatives: parsed.alternatives || [],
      confidence: parsed.confidence || 0,
      generatedAt: new Date().toISOString(),
    }
  } catch {
    throw new Error('Failed to parse AI matching response')
  }
}
