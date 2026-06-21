'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
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

      const { data: partners } = await (getSupabase() as any)
        .from('support_partners')
        .select('*')
        .eq('auth_id', auth.user.id)
        .limit(1)

      const partner = ((partners || [])[0] as any)

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

  const toggleCategory = (c: string) => {
    setSelectedCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  }

  const toggleLanguage = (l: string) => {
    setSelectedLanguages((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l])
  }

  const handleSubmit = async () => {
    if (!bio.trim()) { toast.error('Please write a short bio'); return }
    if (selectedCategories.length === 0) { toast.error('Select at least one service category'); return }
    if (selectedLanguages.length === 0) { toast.error('Select at least one language'); return }

    setSubmitting(true)

    const { data: auth } = await getSupabase().auth.getUser()
    if (!auth.user) { router.replace('/login'); return }

    const payload = {
      auth_id: auth.user.id,
      name: name.trim() || auth.user.email?.split('@')[0] || 'Partner',
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

    if (error) {
      toast.error('Failed to submit')
      setSubmitting(false)
      return
    }

    toast.success('Profile submitted for review!')
    router.push('/partner')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-xl mx-auto w-full px-6 pt-8 pb-16">

        <h1 className="text-lg font-semibold text-foreground mb-2">Complete your profile</h1>
        <p className="text-base text-muted-foreground mb-8">Tell us about yourself so we can find the right support journeys for you.</p>

        <div className="space-y-6">
          <div>
            <label htmlFor="kyc-name" className="text-sm font-medium text-muted-foreground mb-2 block">Full name</label>
            <input
              id="kyc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-card border-2 border-border/80 rounded-2xl py-4 px-5 text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all min-h-[56px]"
            />
          </div>

          <div>
            <label htmlFor="kyc-phone" className="text-sm font-medium text-muted-foreground mb-2 block">Phone number</label>
            <input
              id="kyc-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Your phone number"
              className="w-full bg-card border-2 border-border/80 rounded-2xl py-4 px-5 text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all min-h-[56px]"
            />
          </div>

          <div>
            <label htmlFor="kyc-bio" className="text-sm font-medium text-muted-foreground mb-2 block">Bio</label>
            <textarea
              id="kyc-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your experience, skills, and what kind of support you provide..."
              rows={4}
              className="w-full bg-card border-2 border-border/80 rounded-2xl py-4 px-5 text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all resize-none min-h-[120px]"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Service categories</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCategory(c)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                    selectedCategories.includes(c)
                      ? 'bg-teal/10 text-teal border-teal/30'
                      : 'bg-card text-muted-foreground border-border/80 hover:border-teal/20'
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Languages</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => toggleLanguage(l)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                    selectedLanguages.includes(l)
                      ? 'bg-teal/10 text-teal border-teal/30'
                      : 'bg-card text-muted-foreground border-border/80 hover:border-teal/20'
                  }`}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Hourly rate (₹)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full bg-card border-2 border-border/80 rounded-2xl py-4 px-5 text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all min-h-[56px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Service radius (km)</label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full bg-card border-2 border-border/80 rounded-2xl py-4 px-5 text-base focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 transition-all min-h-[56px]"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-teal text-white py-4 px-8 rounded-2xl font-semibold text-base hover:opacity-90 transition-all disabled:opacity-30 min-h-[56px] mt-8"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
            </span>
          ) : (
            'Submit for Review'
          )}
        </button>
      </div>
    </div>
  )
}
