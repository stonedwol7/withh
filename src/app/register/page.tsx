'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/use-store'
import { ArrowLeft, UserCircle, Briefcase, Loader2 } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { BrandSignature } from '@/components/brand/brand-signature'

export default function RegisterPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const initialize = useAppStore((s) => s.initialize)
  const [role, setRole] = useState<'customer' | 'partner' | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    if (!role || !name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    setError(null)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = !!supabaseUrl && !supabaseUrl.includes('your_supabase')

    if (hasSupabase) {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        })

        if (!authError && authData?.user) {
          const table = role === 'customer' ? 'customers' : 'support_partners'
          const { error: insertError } = await supabase.from(table).insert({
            auth_id: authData.user.id,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || null,
          })

          if (!insertError) {
            await login(email.trim(), password.trim())
            await initialize()
            setSubmitting(false)
            router.push(role === 'customer' ? '/customer' : '/partner')
            return
          }
        }
      } catch {}
    }

    await login(email.trim(), password.trim())
    await initialize()
    setSubmitting(false)
    router.push(role === 'customer' ? '/customer' : '/partner')
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
        <h1 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">Create Account</h1>
        <p className="text-sm text-muted-foreground mb-8 animate-fade-in">Join WITHH as a customer or support partner.</p>

        <div className="flex gap-3 mb-8 animate-fade-in-up">
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

        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
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
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          Already have an account?{' '}
          <Link href="/login" className="text-accent font-medium hover:underline">Sign in</Link>
        </p>

        <div className="text-center mt-6 animate-fade-in">
          <span className="text-xs text-muted-foreground/60">Demo mode</span>
        </div>
      </div>
    </div>
  )
}
