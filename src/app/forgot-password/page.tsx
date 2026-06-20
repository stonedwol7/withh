'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim()) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
      })
      if (error) {
        toast.error(error.message)
      } else {
        setSent(true)
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-alabaster flex items-center justify-center px-5">
        <div className="w-full max-w-sm text-center">
          <CheckCircle className="w-10 h-10 text-green mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-6">
            We sent a password reset link to <span className="font-medium text-slate">{email}</span>
          </p>
          <button onClick={() => router.push('/login')} className="text-sm text-copper font-medium hover:underline">
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-alabaster flex flex-col">
      <header className="bg-alabaster/80 backdrop-blur-xl border-b border-slate/5 px-5 h-14 flex items-center">
        <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate/5 transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-slate" />
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-slate tracking-tight">WITHH.ME</p>
            <p className="text-sm text-muted-foreground mt-1.5">Reset your password</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-card border border-slate/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-copper/20 focus:border-copper transition-all placeholder:text-muted-foreground/40 min-h-[48px]"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !email.trim()}
              className="w-full bg-copper text-white py-3.5 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-30 flex items-center justify-center gap-2 text-sm min-h-[48px]"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Remember your password?{' '}
            <button onClick={() => router.push('/login')} className="text-copper font-medium hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )
}
