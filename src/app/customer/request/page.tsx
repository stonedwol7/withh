'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { RequestStepLayout } from '@/components/shared/request-step-layout'
import { User, Users, ChevronRight } from 'lucide-react'

export default function RequestStep1() {
  const router = useRouter()
  const setDraft = useAppStore((s) => s.setRequestDraft)

  return (
    <RequestStepLayout
      step={1}
      title="Who needs support?"
      onBack={() => router.push('/customer')}
    >
      <p className="text-muted-foreground text-sm mb-8">Select who we will be supporting.</p>
      <div className="space-y-4">
        <button
          onClick={() => {
            setDraft({ whoNeedsSupport: 'me' })
            router.push('/customer/request/step2')
          }}
          className="w-full bg-card rounded-2xl border border-border p-6 flex items-center gap-4 hover:border-accent/30 transition-all text-left card-hover"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
            <User className="w-7 h-7 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-foreground">Me</p>
            <p className="text-sm text-muted-foreground">I need support for myself</p>
          </div>
          <ChevronRight className="w-5 h-5 text-border" />
        </button>

        <button
          onClick={() => {
            setDraft({ whoNeedsSupport: 'someone-else' })
            router.push('/customer/request/step2')
          }}
          className="w-full bg-card rounded-2xl border border-border p-6 flex items-center gap-4 hover:border-accent/30 transition-all text-left card-hover"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Users className="w-7 h-7 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-foreground">Someone Else</p>
            <p className="text-sm text-muted-foreground">I&apos;m requesting on behalf of someone</p>
          </div>
          <ChevronRight className="w-5 h-5 text-border" />
        </button>
      </div>
    </RequestStepLayout>
  )
}
