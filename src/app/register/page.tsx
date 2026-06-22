'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, UserCircle, Briefcase, Loader2, Mail } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            role,
            name: name.trim(),
            phone: phone.trim() || null,
          },
        },
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

      if (authData.user.identities?.length === 0) {
        setConfirmed(true)
        setSubmitting(false)
        return
      }

      setSubmitting(false)
      router.push(role === 'customer' ? '/dashboard' : '/partner/kyc')
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
        <div className="ml-2">
          <Image src="/logo-horizontal.png" alt="WITHH" width={80} height={20} className="object-contain" priority />
        </div>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full px-5 pt-6 pb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">Create Account</h1>
        <p className="text-sm text-muted-foreground mb-6 md:mb-8">Join WITHH as a customer or support partner.</p>

        <div className="flex gap-2.5 md:gap-3 mb-6 md:mb-8">
          <button
            onClick={() => setRole('customer')}
            className={`flex-1 p-3.5 md:p-4 rounded-xl md:rounded-2xl border text-center transition-all hover:border-accent/30 min-h-[80px] ${
              role === 'customer' ? 'border-accent bg-accent/5 ring-1 ring-accent/20' : 'border-border bg-card'
            }`}
          >
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl mx-auto mb-1.5 flex items-center justify-center ${
              role === 'customer' ? 'bg-accent/10' : 'bg-muted'
            }`}>
              <UserCircle className={`w-4 h-4 md:w-5 md:h-5 ${role === 'customer' ? 'text-accent' : 'text-muted-foreground'}`} />
            </div>
            <p className={`text-xs md:text-sm font-medium ${role === 'customer' ? 'text-accent' : 'text-foreground'}`}>Customer</p>
          </button>
          <button
            onClick={() => setRole('partner')}
            className={`flex-1 p-3.5 md:p-4 rounded-xl md:rounded-2xl border text-center transition-all hover:border-green/30 min-h-[80px] ${
              role === 'partner' ? 'border-green bg-green/5 ring-1 ring-green/20' : 'border-border bg-card'
            }`}
          >
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl mx-auto mb-1.5 flex items-center justify-center ${
              role === 'partner' ? 'bg-green/10' : 'bg-muted'
            }`}>
              <Briefcase className={`w-4 h-4 md:w-5 md:h-5 ${role === 'partner' ? 'text-green' : 'text-muted-foreground'}`} />
            </div>
            <p className={`text-xs md:text-sm font-medium ${role === 'partner' ? 'text-green' : 'text-foreground'}`}>Partner</p>
          </button>
        </div>

        <div className="space-y-3.5 md:space-y-4">
          <div>
            <label className="text-xs md:text-sm font-medium text-foreground mb-1 block" htmlFor="regName">Full Name *</label>
            <input
              id="regName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all min-h-[48px]"
            />
          </div>
          <div>
            <label className="text-xs md:text-sm font-medium text-foreground mb-1 block" htmlFor="regEmail">Email *</label>
            <input
              id="regEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              type="email"
              className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all min-h-[48px]"
            />
          </div>
          <div>
            <label className="text-xs md:text-sm font-medium text-foreground mb-1 block" htmlFor="regPhone">Phone</label>
            <input
              id="regPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              type="tel"
              className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all min-h-[48px]"
            />
          </div>
          <div>
            <label className="text-xs md:text-sm font-medium text-foreground mb-1 block" htmlFor="regPassword">Password *</label>
            <input
              id="regPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              type="password"
              className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all min-h-[48px]"
            />
          </div>

          {error && (
            <p className="text-xs text-red text-center">{error}</p>
          )}

          <button
            onClick={handleRegister}
            disabled={submitting || !role || !name.trim() || !email.trim() || !password.trim()}
            className="w-full bg-accent text-white py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2 text-sm shadow-lg shadow-accent/20 min-h-[48px]"
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
