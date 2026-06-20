import type { MatchedPartner } from '@/lib/store/booking-store'
import type { ParsedIntent } from '@/lib/intent-parser'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database.types'

type PartnerMeta = Database['public']['Tables']['partners_meta']['Row']

export async function findBestMatch(intent: ParsedIntent, location: string): Promise<MatchedPartner | null> {
  const supabase = createClient()

  const { data: partners } = await supabase
    .from('partners_meta')
    .select('*, profiles!inner(full_name, avatar_url)')
    .eq('kyc_status', 'verified')
    .overlaps('languages', intent.languages.length > 0 ? intent.languages : ['english'])
    .returns<(PartnerMeta & { profiles: { full_name: string | null; avatar_url: string | null } })[]>()
    .limit(20)

  if (!partners || partners.length === 0) {
    return getFallbackPartner(intent)
  }

  const scored = partners.map((p) => ({
    partner: p,
    score: scorePartner(p, intent),
  }))

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]

  if (!best || best.score < 1) return getFallbackPartner(intent)

  return {
    id: best.partner.id,
    name: best.partner.profiles?.full_name || 'A Support Partner',
    languages: best.partner.languages,
    bio: best.partner.bio || 'Experienced and verified support partner.',
    rating: best.partner.rating_avg || 0,
    ratingCount: best.partner.rating_count || 0,
    completedJourneys: 0,
    tags: best.partner.categories,
    avatarUrl: best.partner.profiles?.avatar_url,
    supportLabel: intent.supportLabel,
  }
}

function scorePartner(partner: PartnerMeta, intent: ParsedIntent): number {
  let score = 0

  const partnerCats = (partner.categories || []).map((c: string) => c.toLowerCase())
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

  if (partner.rating_avg) score += partner.rating_avg * 0.5

  return score
}

function getFallbackPartner(intent: ParsedIntent): MatchedPartner {
  const labels: Record<string, { name: string; bio: string; tags: string[] }> = {
    'Medical companionship': {
      name: 'Priya Sharma',
      bio: 'Quiet, calm presence with experience accompanying patients in hospitals and clinics across Bangalore.',
      tags: ['medical', 'elderly', 'kannada', 'hindi', 'english'],
    },
    'Elderly care companionship': {
      name: 'Anita Rao',
      bio: 'Warm and patient companion skilled in elderly care. Comfortable with medical appointments and daily errands.',
      tags: ['elderly', 'companionship', 'kannada', 'english'],
    },
    'Government office assistance': {
      name: 'Ravi Kumar',
      bio: 'Experienced navigating Bangalore government offices, courts, and documentation. Speaks Kannada, Hindi, and English.',
      tags: ['government', 'documentation', 'kannada', 'hindi', 'english'],
    },
    'Travel assistance': {
      name: 'Suresh Patel',
      bio: 'Reliable travel companion familiar with Bangalore airport, railway stations, and bus terminals.',
      tags: ['travel', 'general', 'kannada', 'hindi', 'english'],
    },
    'Legal support accompaniment': {
      name: 'Vikram Joshi',
      bio: 'Accompanied clients to over 30 court appearances and legal proceedings. Calm under pressure.',
      tags: ['court', 'government', 'kannada', 'english'],
    },
    'Emotional support companionship': {
      name: 'Meera Nair',
      bio: 'Kind, empathetic listener who provides a reassuring presence during difficult moments.',
      tags: ['companionship', 'general', 'kannada', 'english', 'hindi'],
    },
  }

  const fallback = labels[intent.supportLabel] || {
    name: 'Aditya Verma',
    bio: 'Verified support partner with experience across a wide range of situations. Friendly, reliable, and professional.',
    tags: ['general', 'kannada', 'hindi', 'english'],
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
    supportLabel: intent.supportLabel,
  }
}
