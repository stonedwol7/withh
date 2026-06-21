import type { MatchedPartner } from '@/lib/store/booking-store'
import type { ParsedIntent } from '@/lib/intent-parser'
import { createClient } from '@/lib/supabase/client'

export async function findBestMatch(intent: ParsedIntent, location: string): Promise<MatchedPartner | null> {
  const supabase = createClient()

  const { data: raw } = await (supabase as any)
    .from('support_partners')
    .select('*')
    .eq('verification_status', 'verified')
    .overlaps('languages', intent.languages.length > 0 ? intent.languages : ['english'])
    .limit(20)

  const partners = (raw || []) as any[]

  if (!partners || partners.length === 0) {
    return getFallbackPartner(intent)
  }

  const scored = partners.map((p: any) => ({
    partner: p,
    score: scorePartner(p, intent),
  }))

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]

  if (!best || best.score < 1) return getFallbackPartner(intent)

  return {
    id: best.partner.id,
    name: best.partner.name,
    languages: best.partner.languages,
    bio: best.partner.bio || 'Verified support partner.',
    rating: Number(best.partner.rating) || 0,
    ratingCount: 0,
    completedJourneys: best.partner.completed_journeys || 0,
    tags: best.partner.specialties,
    avatarUrl: best.partner.photo_url,
    gender: best.partner.gender,
    supportLabel: intent.supportLabel,
  }
}

function scorePartner(partner: any, intent: ParsedIntent): number {
  let score = 0

  const partnerCats = (partner.specialties || []).map((c: string) => c.toLowerCase())
  for (const ctx of intent.careContext) {
    if (partnerCats.includes(ctx) || partnerCats.some((pc: string) => pc.includes(ctx))) {
      score += 3
    }
  }

  if (intent.languages.length > 0) {
    const partnerLangs = partner.languages.map((l: string) => l.toLowerCase())
    for (const lang of intent.languages) {
      if (partnerLangs.includes(lang)) score += 2
    }
  }

  if (intent.preferredGender !== 'any' && partner.gender === intent.preferredGender) {
    score += 2
  }

  if (partner.rating) score += Number(partner.rating) * 0.5

  return score
}

function getFallbackPartner(intent: ParsedIntent): MatchedPartner {
  const labels: Record<string, { name: string; bio: string; tags: string[]; gender: string }> = {
    'Medical companionship': {
      name: 'Priya Sharma',
      bio: 'Quiet, calm presence with experience accompanying patients in hospitals and clinics across Bangalore.',
      tags: ['medical', 'elderly', 'kannada', 'hindi', 'english'],
      gender: 'female',
    },
    'Elderly care companionship': {
      name: 'Anita Rao',
      bio: 'Warm and patient companion skilled in elderly care. Comfortable with medical appointments and daily errands.',
      tags: ['elderly', 'companionship', 'kannada', 'english'],
      gender: 'female',
    },
    'Government office assistance': {
      name: 'Ravi Kumar',
      bio: 'Experienced navigating Bangalore government offices, courts, and documentation. Speaks Kannada, Hindi, and English.',
      tags: ['government', 'documentation', 'kannada', 'hindi', 'english'],
      gender: 'male',
    },
    'Travel assistance': {
      name: 'Suresh Patel',
      bio: 'Reliable travel companion familiar with Bangalore airport, railway stations, and bus terminals.',
      tags: ['travel', 'general', 'kannada', 'hindi', 'english'],
      gender: 'male',
    },
    'Legal support accompaniment': {
      name: 'Vikram Joshi',
      bio: 'Accompanied clients to over 30 court appearances and legal proceedings. Calm under pressure.',
      tags: ['court', 'government', 'kannada', 'english'],
      gender: 'male',
    },
    'Emotional support companionship': {
      name: 'Meera Nair',
      bio: 'Kind, empathetic listener who provides a reassuring presence during difficult moments.',
      tags: ['companionship', 'general', 'kannada', 'english', 'hindi'],
      gender: 'female',
    },
  }

  const fallback = labels[intent.supportLabel] || {
    name: 'Aditya Verma',
    bio: 'Verified support partner with experience across a wide range of situations. Friendly, reliable, and professional.',
    tags: ['general', 'kannada', 'hindi', 'english'],
    gender: 'male',
  }

  return {
    id: 'fallback',
    name: fallback.name,
    languages: fallback.tags.filter((t) => ['kannada', 'hindi', 'english', 'tamil', 'telugu', 'malayalam', 'urdu'].includes(t)),
    bio: fallback.bio,
    rating: 4.8,
    ratingCount: 24,
    completedJourneys: 36,
    tags: fallback.tags,
    avatarUrl: null,
    gender: fallback.gender,
    supportLabel: intent.supportLabel,
  }
}
