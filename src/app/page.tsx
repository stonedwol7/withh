'use client'

import { useRouter } from 'next/navigation'
import { Shield, Heart, Users, Phone } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-16 pb-10 max-w-xl mx-auto w-full">
        <div className="mb-10">
          <p className="text-xs font-semibold text-foreground/30 tracking-[0.2em] uppercase mb-6">
            WITHH
          </p>
          <h1 className="text-3xl leading-tight font-bold text-foreground tracking-tight mb-3">
            Trusted Human Support
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Support from a trusted person when it matters most.
          </p>
        </div>

        <button
          onClick={() => router.push('/book')}
          className="w-full bg-foreground text-background py-4 px-8 rounded-xl font-semibold text-base hover:bg-foreground/90 transition-all active:scale-[0.98]"
        >
          Request Support
        </button>

        <button
          onClick={() => router.push('/book')}
          className="w-full text-center text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors mt-4 py-2"
        >
          Need help for someone else?
        </button>

        <div className="mt-10 bg-card rounded-xl border border-border/60 p-5">
          <div className="grid grid-cols-2 gap-y-3 gap-x-5">
            <div className="flex items-center gap-2.5">
              <Shield className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
              <span className="text-sm text-foreground/70">Verified partners</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Heart className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
              <span className="text-sm text-foreground/70">Human-reviewed matching</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
              <span className="text-sm text-foreground/70">Male & Female partners</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
              <span className="text-sm text-foreground/70">WITHH Support Team</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-12 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
