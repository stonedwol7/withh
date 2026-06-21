import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MatchedPartner {
  id: string
  name: string
  age?: number
  languages: string[]
  bio: string
  rating: number
  ratingCount: number
  completedJourneys: number
  tags: string[]
  avatarUrl?: string | null
  gender?: string
  supportLabel?: string
}

export interface BookingDraft {
  forWhom: 'myself' | 'lovedOne' | null
  principalName: string
  userNeedDescription: string
  scheduledAt: string | null
  location: string
  durationHours: number
  preferredGender: 'any' | 'female' | 'male'
  language: string
  trustedContact: string
  suggestedPartner: MatchedPartner | null
}

interface BookingStore {
  draft: BookingDraft
  setField: <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => void
  reset: () => void
}

export const HOURLY_RATE = 299

const initialDraft: BookingDraft = {
  forWhom: null,
  principalName: '',
  userNeedDescription: '',
  scheduledAt: null,
  location: '',
  durationHours: 2,
  preferredGender: 'any',
  language: '',
  trustedContact: '',
  suggestedPartner: null,
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      draft: initialDraft,
      setField: (key, value) => set((state) => ({ draft: { ...state.draft, [key]: value } })),
      reset: () => set({ draft: initialDraft }),
    }),
    { name: 'withh-booking-draft' }
  )
)
