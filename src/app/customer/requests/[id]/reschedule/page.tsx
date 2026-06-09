'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { ArrowLeft, Calendar } from 'lucide-react'

export default function ReschedulePage() {
  const router = useRouter()
  const params = useParams()
  const request = useAppStore((s) => s.getRequest(params.id as string))
  const updateStatus = useAppStore((s) => s.updateRequestStatus)
  const [date, setDate] = useState(request?.date || '')
  const [time, setTime] = useState(request?.time || '')
  const [submitting, setSubmitting] = useState(false)

  if (!request) {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <p className="text-muted-foreground">Request not found</p>
      </div>
    )
  }

  const handleReschedule = () => {
    if (!date || !time) return
    setSubmitting(true)
    updateStatus(params.id as string, 'submitted')
    setTimeout(() => {
      router.push(`/customer/requests/${params.id}`)
    }, 500)
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-accent mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-7 h-7 text-accent" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Reschedule Journey</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Pick a new date and time for your {request.category} journey
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">New Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 rounded-xl border border-border bg-card text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">New Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-3 rounded-xl border border-border bg-card text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium text-sm"
        >
          Keep Original
        </button>
        <button
          onClick={handleReschedule}
          disabled={!date || !time || submitting}
          className="flex-1 py-3 rounded-xl bg-accent text-white font-bold text-sm disabled:opacity-40"
        >
          {submitting ? 'Rescheduling...' : 'Confirm Reschedule'}
        </button>
      </div>
    </div>
  )
}
