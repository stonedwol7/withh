'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/use-store'
import { ArrowLeft, UserCircle, Briefcase, Loader2, CheckCircle, Mail } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { BrandSignature } from '@/components/brand/brand-signature'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((s) => s.login)
  const initialize = useAppStore((s) => s.initialize)
  const [role, setRole] = useState<'customer' | 'partner' | null>(null)

  useEffect(() => {
    const r = searchParams.get('role')
    if (r === 'partner') setRole('partner')
  }, [searchParams])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const handleRegister = async () => {
    if (!role || !name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      })

      if (authError) {
        setError(authError.message)
        setSubmitting(false)
        return
      }

      if (!authData?.user) {
        setError('Account creation failed. Please try again.')
        setSubmitting(false)
        return
      }

      const table = role === 'customer' ? 'customers' : 'support_partners'
      const { error: insertError } = await supabase.from(table).insert({
        auth_id: authData.user.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      })

      if (insertError) {
        setError('Failed to create profile. Please contact support.')
        setSubmitting(false)
        return
      }

      const ok = await login(email.trim(), password.trim())
      if (ok) {
        await initialize()
        setSubmitting(false)
        router.push(role === 'customer' ? '/customer' : '/partner')
        return
      }

      setConfirmed(true)
      setSubmitting(false)
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Click the link to activate your account, then sign in.
          </p>
          <Link
            href="/login"
            className="inline-block bg-accent text-white px-6 py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-all"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card/80 backdrop-blur-lg border-b border-border px-4 h-14 flex items-center sticky top-0 z-40">
        <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <BrandSignature markSize={16} />
      </header>

      <div className="flex-1 max-w-md mx-auto w-full px-5 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
        <p className="text-sm text-muted-foreground mb-8">Join WITHH as a customer or support partner.</p>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setRole('customer')}
            className={`flex-1 p-4 rounded-2xl border text-center transition-all hover:border-accent/30 ${
              role === 'customer' ? 'border-accent bg-accent/5 ring-1 ring-accent/20' : 'border-border bg-card'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
              role === 'customer' ? 'bg-accent/10' : 'bg-muted'
            }`}>
              <UserCircle className={`w-5 h-5 ${role === 'customer' ? 'text-accent' : 'text-muted-foreground'}`} />
            </div>
            <p className={`text-sm font-medium ${role === 'customer' ? 'text-accent' : 'text-foreground'}`}>Customer</p>
          </button>
          <button
            onClick={() => setRole('partner')}
            className={`flex-1 p-4 rounded-2xl border text-center transition-all hover:border-green/30 ${
              role === 'partner' ? 'border-green bg-green/5 ring-1 ring-green/20' : 'border-border bg-card'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${
              role === 'partner' ? 'bg-green/10' : 'bg-muted'
            }`}>
              <Briefcase className={`w-5 h-5 ${role === 'partner' ? 'text-green' : 'text-muted-foreground'}`} />
            </div>
            <p className={`text-sm font-medium ${role === 'partner' ? 'text-green' : 'text-foreground'}`}>Partner</p>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block" htmlFor="regName">Full Name *</label>
            <input
              id="regName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block" htmlFor="regEmail">Email *</label>
            <input
              id="regEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              type="email"
              className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block" htmlFor="regPhone">Phone</label>
            <input
              id="regPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              type="tel"
              className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block" htmlFor="regPassword">Password *</label>
            <input
              id="regPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              type="password"
              className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red text-center">{error}</p>
          )}

          <button
            onClick={handleRegister}
            disabled={submitting || !role || !name.trim() || !email.trim() || !password.trim()}
            className="w-full bg-accent text-white py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2 text-sm shadow-lg shadow-accent/20"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RegisterForm />
    </Suspense>
  )
}
