'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { RequestStepLayout } from '@/components/shared/request-step-layout'
import { LocationPicker } from '@/components/shared/location-picker'
import { useState } from 'react'

export default function RequestStep3() {
  const router = useRouter()
  const draft = useAppStore((s) => s.requestDraft)
  const setDraft = useAppStore((s) => s.setRequestDraft)
  const [meetingLocation, setMeetingLocation] = useState(draft.meetingLocation || '')
  const [destination, setDestination] = useState(draft.destination || '')

  return (
    <RequestStepLayout step={3} title="Location">
      <p className="text-muted-foreground text-sm mb-8">Where should we meet you?</p>

      <LocationPicker
        meetingLocation={meetingLocation}
        destination={destination}
        onMeetingLocationChange={setMeetingLocation}
        onDestinationChange={setDestination}
      />

      <div className="mt-5">
        <button
          onClick={() => {
            if (!meetingLocation.trim()) return
            setDraft({ meetingLocation, destination })
            router.push('/customer/request/step4')
          }}
          disabled={!meetingLocation.trim()}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </RequestStepLayout>
  )
}
