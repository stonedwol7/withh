import type { SupportCategory, RequestStatus, SupportDuration, GenderPreference, Language } from '@/lib/types'

export const CATEGORY_LABELS: Record<SupportCategory, string> = {
  hospital: 'Hospital & Medical',
  government: 'Government Office',
  interview: 'Interview Support',
  elderly: 'Elderly Support',
  event: 'Events & Social',
  other: 'Other Errands',
}

export const CATEGORY_ICONS: Record<SupportCategory, string> = {
  hospital: '🏥',
  government: '🏛️',
  interview: '💼',
  elderly: '👴',
  event: '🎉',
  other: '📋',
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  reviewing: 'Under Review',
  'finding-partner': 'Finding Partner',
  'partner-assigned': 'Partner Assigned',
  'awaiting-customer-confirmation': 'Awaiting Confirmation',
  confirmed: 'Confirmed',
  'partner-en-route': 'Partner En Route',
  'partner-arrived': 'Partner Arrived',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const STATUS_COLORS: Record<RequestStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-blue/10 text-blue',
  reviewing: 'bg-amber/10 text-amber',
  'finding-partner': 'bg-amber/10 text-amber',
  'partner-assigned': 'bg-purple/10 text-purple',
  'awaiting-customer-confirmation': 'bg-purple/10 text-purple',
  confirmed: 'bg-green/10 text-green',
  'partner-en-route': 'bg-blue/10 text-blue',
  'partner-arrived': 'bg-blue/10 text-blue',
  'in-progress': 'bg-green/10 text-green',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red/10 text-red',
}

export const DURATION_LABELS: Record<SupportDuration, string> = {
  'under-2': 'Under 2 hours',
  '2-4': '2–4 hours',
  'more-4': 'More than 4 hours',
}

export const GENDER_LABELS: Record<GenderPreference, string> = {
  female: 'Female',
  male: 'Male',
  'no-preference': 'No Preference',
}

export const LANGUAGE_LABELS: Record<Language | 'no-preference', string> = {
  kannada: 'ಕನ್ನಡ',
  english: 'English',
  hindi: 'हिन्दी',
  tamil: 'தமிழ்',
  telugu: 'తెలుగు',
  urdu: 'اردو',
  malayalam: 'മലയാളം',
  'no-preference': 'No Preference',
}

export const PRICING = {
  standard: 699,
  sensitive: 899,
  additionalHour: 199,
}

export const STATUS_STEPS: RequestStatus[] = [
  'submitted',
  'finding-partner',
  'partner-assigned',
  'confirmed',
  'partner-en-route',
  'in-progress',
  'completed',
]
