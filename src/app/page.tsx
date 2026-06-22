'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Shield, Heart, Users, Phone } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-8 pb-10 max-w-xl mx-auto w-full">
        <div className="mb-6">
          <Image
            src="/logo-horizontal.png"
            alt="WITHH"
            width={120}
            height={30}
            className="object-contain"
            priority
          />
        </div>

        <div className="mb-8 -mx-6">
          <Image
            src="/hero-illustration.png"
            alt=""
            width={600}
            height={300}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl leading-tight font-bold text-foreground tracking-tight mb-2">
          Never go alone
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          Trusted human support for life&apos;s important moments.
        </p>

        <button
          onClick={() => router.push('/book')}
          className="w-full bg-foreground text-background py-4 px-8 rounded-xl font-semibold text-sm hover:bg-foreground/90 transition-all active:scale-[0.98]"
        >
          Request Support
        </button>

        <div className="mt-8 bg-card rounded-xl border border-border/60 p-4">
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
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

        <div className="mt-auto pt-10 text-center">
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => router.push('/login')}
              className="text-sm text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors">Sign in</button>
            <span className="text-muted-foreground/20">·</span>
            <button onClick={() => router.push('/register?role=partner')}
              className="text-sm text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors">Become a Partner</button>
          </div>
        </div>
      </div>
    </div>
  )
}
