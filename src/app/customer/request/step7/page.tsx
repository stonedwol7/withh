'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { useAuthStore } from '@/store/auth-store'
import { RequestStepLayout } from '@/components/shared/request-step-layout'
import { InfoRow } from '@/components/shared/info-row'
import { CATEGORY_LABELS, DURATION_LABELS, PRICING } from '@/lib/constants'
import { MapPin, Calendar, Clock, User, MessageSquare, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { clearSavedDraft } from '@/lib/draft-autosave'

export default function RequestStep7() {
  const router = useRouter()
  const draft = useAppStore((s) => s.requestDraft)
  const submitRequest = useAppStore((s) => s.submitRequest)
  const { isAuthenticated, login, loading: authLoading, error } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)
  const [consented, setConsented] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const category = draft.category || 'other'
  const isSensitive = category === 'hospital' || category === 'appointment' || category === 'elderly'
  const amount = isSensitive ? PRICING.sensitive : PRICING.standard

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    setSubmitting(true)
    const id = await submitRequest()
    setSubmitting(false)
    if (id) {
      clearSavedDraft()
      toast.success('Support request submitted!')
      setTimeout(() => router.push(`/customer/requests/${id}`), 600)
    } else {
      toast.error('Please fill in all required fields.')
    }
  }

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return
    const ok = await login(email.trim(), password.trim())
    if (ok) {
      setShowLogin(false)
      const id = await submitRequest()
      if (id) {
        clearSavedDraft()
        toast.success('Support request submitted!')
        setTimeout(() => router.push(`/customer/requests/${id}`), 600)
      }
    }
  }

  const handleGoogleLogin = () => {
    import('@/lib/supabase/client').then(({ supabase }) => {
      supabase.auth.signInWithOAuth({ provider: 'google' })
    })
  }

  return (
    <RequestStepLayout step={7} title="Review Your Request">
      <p className="text-muted-foreground text-sm mb-8">Please review all details before submitting.</p>

      <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-4">
        <InfoRow icon={MapPin} label="Support Type" value={CATEGORY_LABELS[category]} />
        <InfoRow icon={MapPin} label="Location" value={draft.meetingLocation || ''} />
        <InfoRow icon={Calendar} label="Date & Time" value={`${draft.date} at ${draft.time}`} />
        <InfoRow icon={Clock} label="Duration" value={DURATION_LABELS[draft.duration || 'under-2']} />
        <InfoRow icon={User} label="Partner Preference" value={draft.genderPreference === 'female' ? 'Female' : draft.genderPreference === 'male' ? 'Male' : 'No Preference'} />
        <InfoRow icon={MessageSquare} label="Language" value={draft.languagePreference && draft.languagePreference !== 'no-preference' ? draft.languagePreference.charAt(0).toUpperCase() + draft.languagePreference.slice(1) : 'No Preference'} />

        {draft.description && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
            <p className="text-sm text-foreground">{draft.description}</p>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5 mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Pricing</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-foreground">{isSensitive ? 'Sensitive Support' : 'Standard Support'}</p>
              <p className="text-xs text-muted-foreground">{isSensitive ? 'Medical / Interview support' : 'General accompaniment'}</p>
            </div>
            <span className="text-sm font-semibold">₹{amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-foreground">Additional Time</p>
              <p className="text-xs text-muted-foreground">₹{PRICING.additionalHour}/hour if needed</p>
            </div>
            <span className="text-sm text-muted-foreground">Included</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between items-center">
            <p className="text-base font-semibold text-foreground">Total</p>
            <p className="text-base font-bold text-foreground">₹{amount}</p>
          </div>
        </div>
      </div>

      <div
        onClick={() => setConsented(!consented)}
        className="flex items-start gap-3 p-4 bg-card rounded-2xl border border-border mb-6 cursor-pointer"
      >
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${consented ? 'bg-accent border-accent text-white' : 'border-muted-foreground/30'}`}>
          {consented && <Check className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">I agree to the Terms of Service & Privacy Policy</p>
          <p className="text-xs text-muted-foreground mt-0.5">By submitting, you consent to data processing, location sharing during active journeys, and communication from WITHH.</p>
        </div>
      </div>

      {showLogin && (
        <div className="bg-muted rounded-2xl border border-border p-5 mb-6 animate-fade-in space-y-3">
          <p className="text-sm font-semibold text-foreground text-center">Sign in to submit your request</p>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-card border border-border rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-background transition-all text-sm font-medium"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full bg-card border border-input rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full bg-card border border-input rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
          />

          {error && <p className="text-xs text-red text-center">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={authLoading || !email.trim() || !password.trim()}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {authLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In & Submit'}
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !consented}
        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Submitting...</>
        ) : (
          'Request Support'
        )}
      </button>
    </RequestStepLayout>
  )
}
