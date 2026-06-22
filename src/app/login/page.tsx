'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, Briefcase } from 'lucide-react'
import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
      router.push(redirectTo)
    } catch {
      setError('Failed to sign in')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) setError(error.message)
    } catch {
      setError('Failed to sign in with Google')
    }
  }

  return (
    <div className="min-h-screen bg-alabaster flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8 md:mb-10">
            <Image src="/logo-horizontal.png" alt="WITHH" width={120} height={30} className="mx-auto object-contain" priority />
            <p className="text-sm text-muted-foreground mt-3">Sign in to your account</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide uppercase">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all placeholder:text-muted-foreground/40 min-h-[48px]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-[10px] md:text-xs font-medium text-muted-foreground tracking-wide uppercase">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all placeholder:text-muted-foreground/40 min-h-[48px]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-destructive/5 border border-destructive/10 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full bg-copper text-white py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 text-sm min-h-[48px]"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </div>

          <div className="flex items-center gap-3 my-6 md:my-8">
            <div className="h-px flex-1 bg-slate/10" />
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">or</span>
            <div className="h-px flex-1 bg-slate/10" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-card border border-slate/10 rounded-xl py-3.5 px-4 flex items-center justify-center gap-3 font-medium text-sm hover:border-copper/20 transition-all min-h-[48px]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center justify-between mt-2">
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-copper transition-colors">
              Forgot password?
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-border/60">
            <Link href="/register?role=partner"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Briefcase className="w-4 h-4" />
              Join as a Support Partner
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-copper font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-alabaster" />}>
      <LoginForm />
    </Suspense>
  )
}
