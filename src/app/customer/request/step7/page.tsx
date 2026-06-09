'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { RequestStepLayout } from '@/components/shared/request-step-layout'
import { InfoRow } from '@/components/shared/info-row'
import { PriceEstimator } from '@/components/shared/price-estimator'
import { CATEGORY_LABELS, CATEGORY_ICONS, DURATION_LABELS, PRICING } from '@/lib/constants'
import { MapPin, Calendar, Clock, User, MessageSquare, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { clearSavedDraft } from '@/lib/draft-autosave'

export default function RequestStep7() {
  const router = useRouter()
  const draft = useAppStore((s) => s.requestDraft)
  const submitRequest = useAppStore((s) => s.submitRequest)
  const [submitting, setSubmitting] = useState(false)
  const [consented, setConsented] = useState(false)

  const category = draft.category || 'other'
  const isSensitive = category === 'hospital' || category === 'interview' || category === 'elderly'
  const amount = isSensitive ? PRICING.sensitive : PRICING.standard

  const handleSubmit = async () => {
    setSubmitting(true)
    const id = await submitRequest()
    setSubmitting(false)
    if (id) {
      clearSavedDraft()
      toast.success('Support request submitted!')
      setTimeout(() => router.push(`/customer/requests/${id}`), 600)
    } else {
      toast.error('Please fill in all required fields.')
    }
  }

  return (
    <RequestStepLayout step={7} title="Review Your Request">
      <p className="text-muted-foreground text-sm mb-8">Please review all details before submitting.</p>

      <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-4">
        <InfoRow icon={MapPin} label="Support Type" value={CATEGORY_LABELS[category]} />
        <InfoRow icon={MapPin} label="Location" value={draft.meetingLocation || ''} />
        <InfoRow icon={Calendar} label="Date & Time" value={`${draft.date} at ${draft.time}`} />
        <InfoRow icon={Clock} label="Duration" value={DURATION_LABELS[draft.duration || 'under-2']} />
        <InfoRow icon={User} label="Partner Preference" value={draft.genderPreference === 'female' ? 'Female' : draft.genderPreference === 'male' ? 'Male' : 'No Preference'} />
        <InfoRow icon={MessageSquare} label="Language" value={draft.languagePreference && draft.languagePreference !== 'no-preference' ? draft.languagePreference.charAt(0).toUpperCase() + draft.languagePreference.slice(1) : 'No Preference'} />

        {draft.description && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
            <p className="text-sm text-foreground">{draft.description}</p>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Pricing</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-foreground">{isSensitive ? 'Sensitive Support' : 'Standard Support'}</p>
              <p className="text-xs text-muted-foreground">{isSensitive ? 'Medical / Interview support' : 'General accompaniment'}</p>
            </div>
            <span className="text-sm font-semibold">₹{amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-foreground">Additional Time</p>
              <p className="text-xs text-muted-foreground">₹{PRICING.additionalHour}/hour if needed</p>
            </div>
            <span className="text-sm text-muted-foreground">Included</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <p className="text-base font-semibold text-foreground">Total</p>
            <p className="text-base font-bold text-foreground">₹{amount}</p>
          </div>
        </div>
      </div>

      <div
        onClick={() => setConsented(!consented)}
        className="flex items-start gap-3 p-4 bg-card rounded-2xl border border-border mb-6 cursor-pointer"
      >
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${consented ? 'bg-accent border-accent text-white' : 'border-muted-foreground/30'}`}>
          {consented && <Check className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">I agree to the Terms of Service & Privacy Policy</p>
          <p className="text-xs text-muted-foreground mt-0.5">By submitting, you consent to data processing, location sharing during active journeys, and communication from WITHH.</p>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !consented}
        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          'Request Support'
        )}
      </button>
    </RequestStepLayout>
  )
}
