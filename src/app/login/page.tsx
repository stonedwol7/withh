'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/use-store'
import { UserCircle, Briefcase, Sparkles, ArrowRight, Building2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const portals = [
  {
    id: 'customer' as const,
    label: 'Customer',
    description: 'Request support for yourself or someone you care about',
    icon: UserCircle,
    route: '/customer',
    gradient: 'from-accent to-blue',
    color: 'text-accent',
    bg: 'bg-accent/5',
  },
  {
    id: 'partner' as const,
    label: 'Support Partner',
    description: 'Complete support journeys and earn',
    icon: Briefcase,
    route: '/partner',
    gradient: 'from-green to-green/80',
    color: 'text-green',
    bg: 'bg-green/5',
  },
  {
    id: 'ops' as const,
    label: 'Operations',
    description: 'Review requests, match partners, monitor supports',
    icon: Building2,
    route: '/ops',
    gradient: 'from-purple to-purple/80',
    color: 'text-purple',
    bg: 'bg-purple/5',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const initialize = useAppStore((s) => s.initialize)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.role)
  const [hovered, setHovered] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isAuthenticated && role) {
      const p = portals.find((p) => p.id === role)
      if (p) router.push(p.route)
    }
  }, [])

  const handlePortalSelect = async (role: 'customer' | 'partner' | 'ops') => {
    const info = portals.find((p) => p.id === role)!
    setLoading(role)
    await login(role, info.label)
    await initialize()
    setLoading(null)
    router.push(info.route)
  }

  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "url('/brand-pattern.png')", backgroundSize: '400px' }}
      />
      <div className="flex-1 flex items-center justify-center p-5 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 animate-fade-in">
            <Image
              src="/logo-stacked.png"
              alt="WITHH"
              width={120}
              height={120}
              className="mx-auto mb-6"
              priority
            />
            <h1 className="text-[44px] font-bold text-foreground leading-none tracking-tight">WITHH</h1>
            <p className="text-base text-muted-foreground mt-3 max-w-xs mx-auto leading-relaxed">
              &ldquo;When you can&apos;t go alone, we&apos;ll go with you.&rdquo;
            </p>
          </div>

          <div className="space-y-3.5">
            {portals.map((portal, idx) => (
              <button
                key={portal.id}
                onClick={() => handlePortalSelect(portal.id)}
                onMouseEnter={() => setHovered(portal.id)}
                onMouseLeave={() => setHovered(null)}
                disabled={loading !== null}
                className="w-full group relative animate-fade-in-up"
                style={{ animationDelay: `${idx * 150 + 200}ms` }}
              >
                <div
                  className={`relative bg-card rounded-2xl border p-5 text-left w-full transition-all duration-300 ${
                    hovered === portal.id
                      ? 'border-transparent shadow-xl shadow-black/5 -translate-y-0.5'
                      : 'border-border shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        hovered === portal.id ? 'scale-110' : ''
                      } ${portal.bg}`}
                    >
                      <portal.icon className={`w-7 h-7 ${portal.color}`} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className={`text-lg font-semibold transition-colors duration-300 ${
                        hovered === portal.id ? portal.color : 'text-foreground'
                      }`}>
                        {portal.label}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{portal.description}</p>
                    </div>
                    <div className={`shrink-0 self-center transition-all duration-300 ${
                      hovered === portal.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        {loading === portal.id ? (
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: '700ms' }}>
            <p className="text-sm text-muted-foreground">
              New here?{' '}
              <Link href="/register" className="text-accent font-medium hover:underline">Create account</Link>
            </p>
          </div>

          <div className="text-center mt-4 animate-fade-in" style={{ animationDelay: '800ms' }}>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
              <Sparkles className="w-3 h-3" />
              <span>Demo mode &middot; No login required</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-6 text-center">
        <p className="text-[10px] text-muted-foreground/40">
          WITHH v1 &middot; Human Accompaniment Platform
        </p>
      </div>
    </div>
  )
}
