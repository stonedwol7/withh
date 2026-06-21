'use client'

import { useRouter } from 'next/navigation'
import { Shield, Heart, Users, Phone } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-16 pb-10 max-w-xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-xs font-semibold text-foreground/40 tracking-[0.25em] uppercase mb-8">
            WITHH
          </h1>
          <h2 className="text-[2rem] leading-[1.15] font-bold text-foreground tracking-tight mb-4">
            Trusted Human Support
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Support from a trusted person when it matters most.
          </p>
        </div>

        <button
          onClick={() => router.push('/book')}
          className="w-full bg-teal text-white py-5 px-8 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg min-h-[60px]"
        >
          Request Support
        </button>

        <button
          onClick={() => router.push('/book')}
          className="w-full text-center text-base text-muted-foreground/60 hover:text-muted-foreground transition-colors mt-5 py-3"
        >
          Need help for someone else?
        </button>

        <div className="mt-12 bg-card rounded-2xl border-2 border-border/60 p-5">
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-teal/70 shrink-0" />
              <span className="text-sm text-foreground">Verified partners</span>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-teal/70 shrink-0" />
              <span className="text-sm text-foreground">Human-reviewed matching</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-teal/70 shrink-0" />
              <span className="text-sm text-foreground">Female &amp; Male partners</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-teal/70 shrink-0" />
              <span className="text-sm text-foreground">WITHH Support Team</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-12 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-base text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
