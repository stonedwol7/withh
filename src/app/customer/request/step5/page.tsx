'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { RequestStepLayout } from '@/components/shared/request-step-layout'
import { VoiceRecorder } from '@/components/shared/voice-recorder'
import { useState } from 'react'
import { toast } from 'sonner'

export default function RequestStep5() {
  const router = useRouter()
  const draft = useAppStore((s) => s.requestDraft)
  const setDraft = useAppStore((s) => s.setRequestDraft)
  const [description, setDescription] = useState(draft.description || '')
  const [accessibilityNeeds, setAccessibilityNeeds] = useState(draft.accessibilityNeeds || '')

  return (
    <RequestStepLayout step={5} title="Additional Information">
      <p className="text-muted-foreground text-sm mb-8">Help us understand your needs better.</p>
      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block" htmlFor="description">
            Tell us more about what you need
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share any details that will help us find the right support for you..."
            rows={4}
            className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent resize-none transition-colors"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Voice Note (Optional)
          </label>
          <div className="w-full bg-card border border-dashed border-input rounded-xl py-4 px-4 flex items-center justify-center">
            <VoiceRecorder onRecordingComplete={(blob, url) => toast.success('Voice note recorded!')} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block" htmlFor="accessibility">
            Accessibility Needs (Optional)
          </label>
          <textarea
            id="accessibility"
            value={accessibilityNeeds}
            onChange={(e) => setAccessibilityNeeds(e.target.value)}
            placeholder="Wheelchair access, hearing assistance, etc."
            rows={2}
            className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent resize-none transition-colors"
          />
        </div>

        <button
          onClick={() => {
            setDraft({ description, accessibilityNeeds })
            router.push('/customer/request/step6')
          }}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all"
        >
          Continue
        </button>
      </div>
    </RequestStepLayout>
  )
}
