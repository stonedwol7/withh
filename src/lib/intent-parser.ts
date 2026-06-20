export interface ParsedIntent {
  languages: string[]
  preferredGender: 'any' | 'female' | 'male'
  careContext: string[]
  supportLabel: string
}

const LANGUAGE_MAP: Record<string, string> = {
  kannada: 'kannada',
  kanadda: 'kannada',
  hindi: 'hindi',
  hindhi: 'hindi',
  tamil: 'tamil',
  tamizh: 'tamil',
  telugu: 'telugu',
  telgu: 'telugu',
  malayalam: 'malayalam',
  english: 'english',
  urdu: 'urdu',
  bengali: 'bengali',
  marathi: 'marathi',
  gujarati: 'gujarati',
  odia: 'odia',
  punjabi: 'punjabi',
}

const GENDER_FEMALE = new Set(['female', 'woman', 'lady', 'women', 'girl', 'mother', 'aunt', 'sister', 'daughter', 'maam', 'madam'])
const GENDER_MALE = new Set(['male', 'man', 'gentleman', 'men', 'boy', 'father', 'uncle', 'brother', 'son', 'sir'])

const CONTEXT_KEYWORDS: Record<string, string[]> = {
  hospital: ['hospital', 'clinic', 'doctor', 'medical', 'check-up', 'surgery', 'appointment', 'health', 'patient', 'medicine', 'discharge'],
  elderly: ['elderly', 'old', 'senior', 'aged', 'father', 'mother', 'grandmother', 'grandfather', 'grandparent'],
  court: ['court', 'legal', 'lawyer', 'hearing', 'case', 'tribunal', 'advocate'],
  travel: ['travel', 'airport', 'railway', 'station', 'bus', 'train', 'flight', 'pick up', 'drop'],
  government: ['government', 'office', 'passport', 'ration', 'bbmp', 'bpl', 'aadhaar', 'pan', 'voter', 'license', 'certificate'],
  appointment: ['meeting', 'interview', 'appointment', 'consultation', 'counseling', 'therapy'],
  companionship: ['company', 'alone', 'scared', 'anxious', 'lonely', 'support', 'accompany', 'sit with', 'stay with', 'talk'],
  documentation: ['document', 'form', 'paperwork', 'application', 'submission', 'file'],
  pharmacy: ['pharmacy', 'medical store', 'medicine', 'chemist', 'prescription'],
}

export function parseIntent(text: string): ParsedIntent {
  const lower = text.toLowerCase()
  const words = lower.split(/\s+/)

  const languages: string[] = []
  for (const word of words) {
    const mapped = LANGUAGE_MAP[word]
    if (mapped && !languages.includes(mapped)) languages.push(mapped)
  }

  let preferredGender: 'any' | 'female' | 'male' = 'any'
  for (const word of words) {
    if (GENDER_FEMALE.has(word)) { preferredGender = 'female'; break }
    if (GENDER_MALE.has(word)) { preferredGender = 'male'; break }
  }

  const careContext: string[] = []
  for (const [ctx, keywords] of Object.entries(CONTEXT_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        careContext.push(ctx)
        break
      }
    }
  }

  const label = deriveSupportLabel(careContext, lower)

  return { languages, preferredGender, careContext, supportLabel: label }
}

function deriveSupportLabel(contexts: string[], text: string): string {
  if (contexts.includes('hospital')) return 'Medical companionship'
  if (contexts.includes('elderly')) return 'Elderly care companionship'
  if (contexts.includes('court')) return 'Legal support accompaniment'
  if (contexts.includes('travel')) return 'Travel assistance'
  if (contexts.includes('government')) return 'Government office assistance'
  if (contexts.includes('pharmacy')) return 'Pharmacy & errand support'
  if (contexts.includes('documentation')) return 'Documentation assistance'
  if (contexts.includes('appointment')) return 'Appointment companionship'
  if (contexts.includes('companionship')) return 'Emotional support companionship'
  return 'Companionship & support'
}
