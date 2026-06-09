'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { RequestStepLayout } from '@/components/shared/request-step-layout'
import { Calendar, Clock } from 'lucide-react'
import { useState } from 'react'

const durations = [
  { id: 'under-2', label: 'Under 2 Hours', desc: 'Quick visit' },
  { id: '2-4', label: '2–4 Hours', desc: 'Half day' },
  { id: 'more-4', label: 'More Than 4 Hours', desc: 'Full day' },
] as const

export default function RequestStep4() {
  const router = useRouter()
  const draft = useAppStore((s) => s.requestDraft)
  const setDraft = useAppStore((s) => s.setRequestDraft)
  const [date, setDate] = useState(draft.date || '')
  const [time, setTime] = useState(draft.time || '')
  const [duration, setDuration] = useState(draft.duration || '')

  const canContinue = date && time && duration

  return (
    <RequestStepLayout step={4} title="Date & Time">
      <p className="text-muted-foreground text-sm mb-8">When do you need support?</p>
      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block" htmlFor="reqDate">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            <input
              id="reqDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-required="true"
              className="w-full bg-card border border-input rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block" htmlFor="reqTime">Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            <input
              id="reqTime"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-required="true"
              className="w-full bg-card border border-input rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">Expected Duration</label>
          <div className="space-y-2">
            {durations.map((d) => (
              <button
                key={d.id}
                onClick={() => setDuration(d.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  duration === d.id
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card'
                }`}
              >
                <p className={`text-sm font-medium ${duration === d.id ? 'text-accent' : 'text-foreground'}`}>
                  {d.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setDraft({ date, time, duration: duration as any })
            router.push('/customer/request/step5')
          }}
          disabled={!canContinue}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </RequestStepLayout>
  )
}
