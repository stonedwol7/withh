'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/use-store'
import { Phone, Shield, Heart, Users, Loader2, Mail, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BrandMark } from '@/components/brand/brand-mark'
import { BrandWordmark } from '@/components/brand/brand-wordmark'

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
  const [phone, setPhone] = useState('')
  const [otpMode, setOtpMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isAuthenticated && role) {
      router.push(role === 'customer' ? '/customer' : role === 'partner' ? '/partner' : '/ops')
    }
  }, [isAuthenticated, role, router])

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) return
    clearError()
    const ok = await login(email.trim(), password.trim())
    if (ok) {
      await initialize()
      const r = useAuthStore.getState().role
      if (r) router.push(r === 'customer' ? '/customer' : r === 'partner' ? '/partner' : '/ops')
    }
  }

  const handleGoogleLogin = () => {
    import('@/lib/supabase/client').then(({ supabase }) => {
      supabase.auth.signInWithOAuth({ provider: 'google' })
    })
  }

  const handlePhoneOtp = () => {
    if (!phone.trim() || phone.length < 10) return
    import('@/lib/supabase/client').then(({ supabase }) => {
      supabase.auth.signInWithOtp({ phone: phone.trim() })
    })
  }

  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('/brand-pattern.png')", backgroundSize: '400px' }} />

      <div className="flex-1 flex items-center justify-center p-5 relative z-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 animate-fade-in">
            <BrandMark size={24} className="text-accent mx-auto mb-5 opacity-50" />
            <p className="text-xl md:text-2xl text-foreground font-semibold">
              Never Alone.
            </p>
            <p className="text-sm text-muted-foreground mt-1">Trusted Human Support</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="h-px flex-1 max-w-16 bg-border" />
              <BrandWordmark size="md" />
              <div className="h-px flex-1 max-w-16 bg-border" />
            </div>
          </div>

          <div className="animate-fade-in-up space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-card border border-border rounded-2xl py-3.5 px-4 flex items-center justify-center gap-3 hover:bg-muted transition-all font-medium text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            {otpMode ? (
              <div className="space-y-3">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  onKeyDown={(e) => e.key === 'Enter' && handlePhoneOtp()}
                  className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
                />
                <button
                  onClick={handlePhoneOtp}
                  disabled={!phone.trim() || phone.length < 10}
                  className="w-full bg-card border border-border rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-muted transition-all font-medium text-sm disabled:opacity-40"
                >
                  <Phone className="w-4 h-4" />
                  Send OTP
                </button>
                <button
                  onClick={() => setOtpMode(false)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to email
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setOtpMode(true)}
                  className="w-full bg-card border border-border rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-muted transition-all font-medium text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Continue with Phone
                </button>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Or email</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                  className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                  className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
                />

                {error && <p className="text-xs text-red text-center">{error}</p>}

                <button
                  onClick={handleEmailLogin}
                  disabled={loading || !email.trim() || !password.trim()}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 animate-fade-in">
            {trustSignals.map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <item.icon className="w-3 h-3" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              New here?{' '}
              <Link href="/register" className="text-accent font-medium hover:underline">Create account</Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
