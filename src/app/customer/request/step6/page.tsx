'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { RequestStepLayout } from '@/components/shared/request-step-layout'
import { toast } from 'sonner'
import { useState } from 'react'
import type { GenderPreference, Language } from '@/lib/types'

const genders: { id: GenderPreference; label: string }[] = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'no-preference', label: 'No Preference' },
]

const languages: { id: Language | 'no-preference'; label: string }[] = [
  { id: 'kannada', label: 'Kannada' },
  { id: 'english', label: 'English' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'telugu', label: 'Telugu' },
  { id: 'urdu', label: 'Urdu' },
  { id: 'no-preference', label: 'No Preference' },
]

export default function RequestStep6() {
  const router = useRouter()
  const draft = useAppStore((s) => s.requestDraft)
  const setDraft = useAppStore((s) => s.setRequestDraft)
  const [genderPref, setGenderPref] = useState<GenderPreference>(draft.genderPreference || 'no-preference')
  const [langPref, setLangPref] = useState<Language | 'no-preference'>(draft.languagePreference || 'no-preference')
  const [tcName, setTcName] = useState(draft.trustedContactName || '')
  const [tcPhone, setTcPhone] = useState(draft.trustedContactPhone || '')
  const [tcRel, setTcRel] = useState(draft.trustedContactRelationship || '')

  return (
    <RequestStepLayout step={6} title="Preferences">
      <p className="text-muted-foreground text-sm mb-8">Help us match you better.</p>
      <div className="space-y-6">
        <fieldset>
          <legend className="text-sm font-medium text-foreground mb-3">Support Partner Preference</legend>
          <div className="flex gap-2 flex-wrap" role="radiogroup">
            {genders.map((g) => (
              <button
                key={g.id}
                onClick={() => setGenderPref(g.id)}
                role="radio"
                aria-checked={genderPref === g.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all btn-press ${
                  genderPref === g.id
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-card text-muted-foreground border-border hover:border-muted-foreground/30'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-foreground mb-3">Language Preference</legend>
          <div className="flex gap-2 flex-wrap" role="radiogroup">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => setLangPref(l.id)}
                role="radio"
                aria-checked={langPref === l.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all btn-press ${
                  langPref === l.id
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'bg-card text-muted-foreground border-border hover:border-muted-foreground/30'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="border-t border-border pt-6">
          <label className="text-sm font-medium text-foreground mb-1.5 block">Trusted Contact (Optional)</label>
          <p className="text-xs text-muted-foreground mb-4">Someone we can reach out to if needed.</p>
          <div className="space-y-3">
            <input
              value={tcName}
              onChange={(e) => setTcName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-colors"
            />
            <input
              value={tcPhone}
              onChange={(e) => setTcPhone(e.target.value)}
              placeholder="Phone Number"
              type="tel"
              className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-colors"
            />
            <input
              value={tcRel}
              onChange={(e) => setTcRel(e.target.value)}
              placeholder="Relationship"
              className="w-full bg-card border border-input rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-colors"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setDraft({
              genderPreference: genderPref,
              languagePreference: langPref,
              trustedContactName: tcName,
              trustedContactPhone: tcPhone,
              trustedContactRelationship: tcRel,
            })
            router.push('/customer/request/step7')
          }}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all btn-press"
        >
          Continue
        </button>
      </div>
    </RequestStepLayout>
  )
}
