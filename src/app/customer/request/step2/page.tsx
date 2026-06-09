'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { RequestStepLayout } from '@/components/shared/request-step-layout'
import { ChevronRight } from 'lucide-react'
import type { SupportCategory } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/constants'

const categories: { id: SupportCategory; icon: string; desc: string }[] = [
  { id: 'hospital', icon: '🏥', desc: 'Medical appointments, check-ups, procedures' },
  { id: 'government', icon: '🏛️', desc: 'BBMP, passport, ration card, etc.' },
  { id: 'appointment', icon: '📅', desc: 'Job interviews, meetings, consultations' },
  { id: 'elderly', icon: '👴', desc: 'Support for senior family members' },
  { id: 'event', icon: '🎉', desc: 'Weddings, gatherings, social events' },
  { id: 'other', icon: '📋', desc: 'Something else we can help with' },
]

export default function RequestStep2() {
  const router = useRouter()
  const setDraft = useAppStore((s) => s.setRequestDraft)

  return (
    <RequestStepLayout step={2} title="Support Category">
      <p className="text-muted-foreground text-sm mb-8">What type of support do you need?</p>
      <div className="space-y-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setDraft({ category: cat.id })
              router.push('/customer/request/step3')
            }}
            className="w-full bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:border-accent/30 transition-all text-left card-hover"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl shrink-0">
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-foreground">{CATEGORY_LABELS[cat.id]}</p>
              <p className="text-sm text-muted-foreground">{cat.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-border shrink-0" />
          </button>
        ))}
      </div>
    </RequestStepLayout>
  )
}
