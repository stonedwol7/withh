'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/use-store'
import { ArrowLeft, UserCircle, Briefcase, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const initialize = useAppStore((s) => s.initialize)
  const [role, setRole] = useState<'customer' | 'partner' | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleRegister = async () => {
    if (!role || !name.trim() || !phone.trim() || !email.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    const useBackend = process.env.NEXT_PUBLIC_USE_LOCAL_BACKEND === 'true'
    if (useBackend) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        const res = await fetch(`${apiUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim(), role }),
        })
        if (res.ok) {
          toast.success('Account created!')
          await login(role, name.trim())
          await initialize()
          setSubmitting(false)
          router.push(role === 'customer' ? '/customer' : '/partner')
          return
        }
      } catch {}
    }
    await login(role, name.trim())
    await initialize()
    setSubmitting(false)
    router.push(role === 'customer' ? '/customer' : '/partner')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card/80 backdrop-blur-lg border-b border-border px-4 h-14 flex items-center sticky top-0 z-40">
        <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-xl hover:bg-muted transition-colors btn-press" aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <Image src="/logo-horizontal.png" alt="WITHH" width={70} height={20} className="object-contain" />
      </header>

      <div className="flex-1 max-w-md mx-auto w-full px-5 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">Create Account</h1>
        <p className="text-sm text-muted-foreground mb-8 animate-fade-in">Join WITHH as a customer or support partner.</p>

        <div className="flex gap-3 mb-8 animate-fade-in-up">
          <button
            onClick={() => setRole('customer')}
            className={`flex-1 p-4 rounded-2xl border text-center transition-all btn-press card-hover ${
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
            className={`flex-1 p-4 rounded-2xl border text-center transition-all btn-press card-hover ${
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
            <label className="text-sm font-medium text-foreground mb-1.5 block" htmlFor="regPhone">Phone Number *</label>
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

          <button
            onClick={handleRegister}
            disabled={submitting || !role}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40 btn-press flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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

        <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
            <Sparkles className="w-3 h-3" />
            <span>Demo mode &middot; No real data stored</span>
          </div>
        </div>
      </div>
    </div>
  )
}
