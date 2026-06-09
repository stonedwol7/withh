'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/use-store'
import { UserCircle, Briefcase, Shield, Heart, Users, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BrandMark } from '@/components/brand/brand-mark'
import { BrandWordmark } from '@/components/brand/brand-wordmark'

const portals = [
  {
    id: 'customer' as const,
    label: 'Customer',
    description: 'Request support for yourself or someone you care about',
    icon: UserCircle,
    route: '/customer',
    color: 'text-accent',
    bg: 'bg-accent/5',
    ring: 'ring-accent/20',
  },
  {
    id: 'partner' as const,
    label: 'Support Partner',
    description: 'Complete support journeys and earn',
    icon: Briefcase,
    route: '/partner',
    color: 'text-green',
    bg: 'bg-green/5',
    ring: 'ring-green/20',
  },
]

const trustSignals = [
  { icon: Shield, text: 'Verified partners' },
  { icon: Heart, text: 'Human-reviewed matching' },
  { icon: Users, text: '24/7 support team' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, role, loading, error, clearError } = useAuthStore()
  const initialize = useAppStore((s) => s.initialize)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isAuthenticated && role) {
      const p = portals.find((p) => p.id === role)
      if (p) router.push(p.route)
    }
  }, [isAuthenticated, role])

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return
    clearError()
    const ok = await login(email.trim(), password.trim())
    if (ok) {
      await initialize()
      const p = portals.find((p) => p.id === useAuthStore.getState().role)
      if (p) router.push(p.route)
    }
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
          <div className="text-center mb-8 animate-fade-in">
            <div className="mb-8">
              <BrandMark size={28} className="text-accent mx-auto mb-5 opacity-60" />
              <p className="text-xl md:text-2xl text-foreground font-normal leading-relaxed max-w-sm mx-auto">
                &ldquo;When you can&apos;t go alone,<br />
                <span className="text-accent font-semibold">we&apos;ll go with you.</span>&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px flex-1 max-w-16 bg-border" />
              <BrandWordmark size="md" />
              <div className="h-px flex-1 max-w-16 bg-border" />
            </div>
          </div>

          <div className="animate-fade-in-up">
            <div className="space-y-3 mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
              />

              {error && (
                <p className="text-xs text-red text-center">{error}</p>
              )}

              <button
                onClick={handleLogin}
                disabled={loading || !email.trim() || !password.trim()}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Or select portal</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-3">
              {portals.map((portal) => (
                <button
                  key={portal.id}
                  onClick={() => handleLogin()}
                  onMouseEnter={() => setSelectedRole(portal.id)}
                  onMouseLeave={() => setSelectedRole(null)}
                  disabled={loading}
                  className="w-full group relative"
                >
                  <div
                    className={`relative bg-card rounded-2xl border p-5 text-left w-full transition-all duration-200 ${
                      selectedRole === portal.id
                        ? 'border-accent/30 shadow-md shadow-black/5'
                        : 'border-border shadow-sm'
                    }`}
                  >
                    {selectedRole === portal.id && (
                      <div className={`absolute inset-0 rounded-2xl opacity-5 ${portal.bg}`} />
                    )}
                    <div className="flex items-start gap-4 relative">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          selectedRole === portal.id ? 'scale-110 shadow-lg' : ''
                        } ${portal.bg}`}
                      >
                        <portal.icon className={`w-7 h-7 ${portal.color}`} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className={`text-lg font-semibold transition-colors duration-300 ${
                          selectedRole === portal.id ? portal.color : 'text-foreground'
                        }`}>
                          {portal.label}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{portal.description}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 animate-fade-in">
            {trustSignals.map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <item.icon className="w-3 h-3" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 animate-fade-in">
            <p className="text-sm text-muted-foreground">
              New here?{' '}
              <Link href="/register" className="text-accent font-medium hover:underline">Create account</Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link href="/ops" className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors">
              Staff access
            </Link>
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
