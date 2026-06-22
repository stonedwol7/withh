'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const CATEGORIES = ['medical', 'government', 'travel', 'general', 'elderly', 'legal'] as const
const LANGUAGES = ['english', 'hindi', 'kannada', 'tamil', 'telugu', 'malayalam', 'urdu', 'bengali'] as const

export default function KYCOnboardingPage() {
  const router = useRouter()
  const getSupabase = () => createClient()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [partnerId, setPartnerId] = useState<string | null>(null)

  const [bio, setBio] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState(299)
  const [radius, setRadius] = useState(10)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    async function init() {
      const { data: auth } = await getSupabase().auth.getUser()
      if (!auth.user) { router.replace('/login'); return }

      const partner = await (getSupabase() as any)
        .from('support_partners')
        .select('*')
        .eq('auth_id', auth.user.id)
        .limit(1)
        .then((r: any) => r.data?.[0])
        .catch(() => null)

      if (partner) {
        if (partner.verification_status === 'verified') {
          router.replace('/partner')
          return
        }
        setPartnerId(partner.id)
        setName(partner.name || '')
        setPhone(partner.phone || '')
        setBio(partner.bio || '')
        setSelectedCategories(partner.specialties || [])
        setSelectedLanguages(partner.languages || [])
      }

      setLoading(false)
    }
    init()
  }, [router])

  const toggleArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]

  const handleSubmit = async () => {
    if (!bio.trim()) { toast.error('Please write a short bio'); return }
    if (selectedCategories.length === 0) { toast.error('Select at least one service category'); return }
    if (selectedLanguages.length === 0) { toast.error('Select at least one language'); return }

    setSubmitting(true)

    const auth = await getSupabase().auth.getUser().then((r) => r.data.user)
    if (!auth) { router.replace('/login'); return }

    const payload = {
      auth_id: auth.id,
      name: name.trim() || auth.email?.split('@')[0] || 'Partner',
      phone: phone.trim() || null,
      bio: bio.trim(),
      specialties: selectedCategories,
      languages: selectedLanguages,
      verification_status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = partnerId
      ? await (getSupabase() as any).from('support_partners').update(payload).eq('id', partnerId)
      : await (getSupabase() as any).from('support_partners').insert(payload)

    if (error) { toast.error('Failed to submit'); setSubmitting(false); return }
    toast.success('Profile submitted for review!')
    router.push('/partner')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-6 pb-12">
        <h1 className="text-lg font-semibold text-foreground mb-1">Complete your profile</h1>
        <p className="text-sm text-muted-foreground mb-6">Tell us about yourself so we can find the right support journeys for you.</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="kyc-name" className="text-xs font-medium text-muted-foreground mb-1.5 block">Full name</label>
            <input id="kyc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
              className="w-full bg-card border border-border/70 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/10 transition-all" />
          </div>

          <div>
            <label htmlFor="kyc-phone" className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone number</label>
            <input id="kyc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number"
              className="w-full bg-card border border-border/70 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/10 transition-all" />
          </div>

          <div>
            <label htmlFor="kyc-bio" className="text-xs font-medium text-muted-foreground mb-1.5 block">Bio</label>
            <textarea id="kyc-bio" value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your experience, skills, and what kind of support you provide..." rows={4}
              className="w-full bg-card border border-border/70 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/10 transition-all resize-none" />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Service categories</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setSelectedCategories(toggleArray(selectedCategories, c))}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    selectedCategories.includes(c)
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-muted-foreground/70 border-border/70 hover:border-foreground/30'
                  }`}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Languages</p>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((l) => (
                <button key={l} onClick={() => setSelectedLanguages(toggleArray(selectedLanguages, l))}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                    selectedLanguages.includes(l)
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-card text-muted-foreground/70 border-border/70 hover:border-foreground/30'
                  }`}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hourly rate (₹)</label>
              <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full bg-card border border-border/70 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/10 transition-all" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Service radius (km)</label>
              <input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full bg-card border border-border/70 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/10 transition-all" />
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full bg-foreground text-background py-3.5 px-6 rounded-xl font-medium text-sm hover:bg-foreground/90 transition-all disabled:opacity-25 mt-6 active:scale-[0.98]">
          {submitting ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>
    </div>
  )
}
