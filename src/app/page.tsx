'use client'

import { useRouter } from 'next/navigation'
import { Shield, Heart, Users, Phone } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-12 pb-8 max-w-sm mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-[10px] font-semibold text-foreground/30 tracking-[0.2em] uppercase mb-6">
            WITHH
          </h1>
          <h2 className="text-[1.75rem] leading-[1.15] font-semibold text-foreground tracking-tight mb-3">
            Trusted Human Support
          </h2>
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            Support from a trusted person when it matters most.
          </p>
        </div>

        <button
          onClick={() => router.push('/book')}
          className="w-full bg-foreground text-background py-4 rounded-2xl font-semibold text-sm hover:opacity-90 transition-all min-h-[52px]"
        >
          Request Support
        </button>

        <button
          onClick={() => router.push('/book')}
          className="w-full text-center text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors mt-4 py-2"
        >
          Need help for someone else?
        </button>

        <div className="mt-10 bg-card rounded-2xl border border-border/60 p-4">
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
              <span className="text-[11px] text-foreground/60">Verified partners</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
              <span className="text-[11px] text-foreground/60">Human-reviewed matching</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
              <span className="text-[11px] text-foreground/60">Female &amp; Male partners</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
              <span className="text-[11px] text-foreground/60">WITHH Support Team</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-10 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-[11px] text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
