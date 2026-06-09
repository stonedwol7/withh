'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

const cancelReasons = [
  'Changed my mind',
  'Found alternative arrangement',
  'Schedule conflict',
  'Feeling unwell',
  'Family emergency',
  'Partner not matching preferences',
  'Financial reasons',
  'Other',
]

export default function CancelRequestPage() {
  const router = useRouter()
  const params = useParams()
  const request = useAppStore((s) => s.getRequest(params.id as string))
  const updateStatus = useAppStore((s) => s.updateRequestStatus)
  const [reason, setReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!request) {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    )
  }

  const handleCancel = () => {
    setSubmitting(true)
    const finalReason = reason === 'Other' ? otherReason : reason
    updateStatus(params.id as string, 'cancelled')
    setTimeout(() => {
      router.push('/customer/requests')
    }, 500)
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-accent mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Cancel Support Request</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Are you sure you want to cancel this request? A cancellation fee may apply based on timing.
        </p>
      </div>

      <div className="space-y-2 mb-6">
        <p className="text-sm font-semibold text-foreground mb-3">Please tell us why:</p>
        {cancelReasons.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
              reason === r
                ? 'border-accent bg-accent/5 text-foreground font-semibold'
                : 'border-border text-muted-foreground hover:border-accent/30'
            }`}
          >
            {r}
          </button>
        ))}
        {reason === 'Other' && (
          <textarea
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
            placeholder="Please describe..."
            className="w-full p-3 rounded-xl border border-border bg-card text-sm mt-2 resize-none h-20"
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium text-sm"
        >
          Keep Request
        </button>
        <button
          onClick={handleCancel}
          disabled={!reason || submitting}
          className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm disabled:opacity-40"
        >
          {submitting ? 'Cancelling...' : 'Yes, Cancel'}
        </button>
      </div>
    </div>
  )
}
