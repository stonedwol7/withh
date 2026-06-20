import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BookingDraft {
  category: 'medical' | 'government' | 'travel' | 'general' | null
  location: string
  principalName: string
  scheduledAt: string | null
  requiresFemalePartner: boolean
  totalPrice: number
}

interface BookingStore {
  draft: BookingDraft
  setField: <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => void
  reset: () => void
}

const initialDraft: BookingDraft = {
  category: null,
  location: '',
  principalName: '',
  scheduledAt: null,
  requiresFemalePartner: false,
  totalPrice: 0,
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
