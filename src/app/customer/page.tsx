'use client'

import { useRouter } from 'next/navigation'
import { CustomerHeader } from '@/components/shared/customer-nav'
import { useAuthStore } from '@/store/auth-store'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/constants'
import { Shield, UserCheck, Heart, Users, ArrowRight, Sparkles } from 'lucide-react'
import { BrandWordmark } from '@/components/brand/brand-wordmark'
import type { SupportCategory } from '@/lib/types'

const categories: SupportCategory[] = ['hospital', 'government', 'interview', 'elderly', 'event', 'other']

const trustSignals = [
  { icon: UserCheck, label: 'Verified Support Partners' },
  { icon: Heart, label: 'Human Reviewed Matching' },
  { icon: Users, label: 'Female & Male Support Partners' },
  { icon: Shield, label: 'WITHH Support Team' },
]

const steps = [
  { num: 1, title: 'Request Support', desc: 'Tell us what you need' },
  { num: 2, title: 'We Find The Right Person', desc: 'We match you carefully' },
  { num: 3, title: 'Confirm Your Match', desc: 'You approve your partner' },
  { num: 4, title: "You're Not Alone", desc: 'Support happens with confidence' },
]

export default function CustomerHome() {
  const router = useRouter()
  const userName = useAuthStore((s) => s.userName)

  return (
    <div>
      <CustomerHeader showBack={false} />

      <div className="px-5 pt-8 pb-4 animate-fade-in">
        <p className="text-sm font-medium text-accent mb-2">Welcome{userName ? `, ${userName}` : ''}</p>
        <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed max-w-sm">
          &ldquo;When you can&apos;t go alone, we&apos;ll go with you.&rdquo;
        </p>
        <div className="mt-4">
          <BrandWordmark size="lg" />
        </div>
      </div>

      <div className="px-5 pb-8 animate-fade-in-up stagger-1">
        <button
          onClick={() => router.push('/customer/request')}
          className="withh-gradient text-white w-full py-4 px-6 rounded-2xl text-lg font-semibold hover:opacity-90 transition-all btn-press shadow-lg shadow-black/10 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Request Support
        </button>
      </div>

      <div className="px-5 pb-8 animate-fade-in-up stagger-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Support Categories</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => router.push(`/customer/request?category=${cat}`)}
              className="bg-card rounded-xl p-4 border border-border card-hover text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-2 group-hover:bg-accent/10 transition-colors">
                <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
              </div>
              <p className="text-sm font-medium text-foreground">{CATEGORY_LABELS[cat]}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8 animate-fade-in-up stagger-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Trust & Safety</h2>
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="grid grid-cols-2 gap-4">
            {trustSignals.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 animate-fade-in-up stagger-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">How It Works</h2>
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.num} className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border card-hover">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                {step.num}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-border ml-auto shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
