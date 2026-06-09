'use client'

import { CustomerHeader } from '@/components/shared/customer-nav'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/use-store'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { useAccessibility } from '@/lib/accessibility-context'
import { useI18n, langNames, type LangCode } from '@/lib/i18n-context'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { User, Shield, Heart, CreditCard, Clock, HelpCircle, ChevronRight, LogOut, Accessibility, Globe, Star, Users } from 'lucide-react'

export default function CustomerProfile() {
  const router = useRouter()
  const doLogout = useAuthStore((s) => s.logout)
  const userName = useAuthStore((s) => s.userName)
  const requests = useAppStore((s) => s.supportRequests)
  const partners = useAppStore((s) => s.supportPartners)
  const { largeText, highContrast, reducedMotion, toggleLargeText, toggleHighContrast, toggleReducedMotion } = useAccessibility()
  const { locale, setLocale } = useI18n()
  const [showLang, setShowLang] = useState(false)

  const stats = useMemo(() => {
    const completed = requests.filter((r) => r.status === 'completed')
    const totalHours = completed.reduce((sum, r) => {
      if (r.duration === 'more-4') return sum + 5
      if (r.duration === '2-4') return sum + 3
      return sum + 1.5
    }, 0)
    const repeatPartnerIds = completed.filter((r) => r.assignedPartnerId).map((r) => r.assignedPartnerId)
    const uniquePartners = new Set(repeatPartnerIds).size
    return { completed: completed.length, totalHours, uniquePartners }
  }, [requests])

  const favoritePartners = useMemo(() => {
    const partnerCount: Record<string, number> = {}
    requests.filter((r) => r.assignedPartnerId).forEach((r) => {
      if (r.assignedPartnerId) partnerCount[r.assignedPartnerId] = (partnerCount[r.assignedPartnerId] || 0) + 1
    })
    return Object.entries(partnerCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => partners.find((p) => p.id === id))
      .filter(Boolean)
  }, [requests, partners])

  return (
    <div>
      <CustomerHeader title="Profile" />

      <div className="px-5 pt-6 pb-6">
        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <div className="flex items-center gap-4">
            <InitialAvatar name={userName || 'Priya Sharma'} size="lg" />
            <div>
              <p className="text-lg font-semibold text-foreground">{userName || 'Priya Sharma'}</p>
              <p className="text-sm text-muted-foreground">+91 98765 43210</p>
              <p className="text-xs text-muted-foreground">Member since Dec 2025</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <Users className="w-5 h-5 text-accent mx-auto mb-1.5" />
            <p className="text-lg font-bold text-foreground">{stats.completed}</p>
            <p className="text-[10px] text-muted-foreground">Journeys</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <Clock className="w-5 h-5 text-green mx-auto mb-1.5" />
            <p className="text-lg font-bold text-foreground">{stats.totalHours}h</p>
            <p className="text-[10px] text-muted-foreground">Accompanied</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <Star className="w-5 h-5 text-amber mx-auto mb-1.5" />
            <p className="text-lg font-bold text-foreground">{stats.uniquePartners}</p>
            <p className="text-[10px] text-muted-foreground">Partners</p>
          </div>
        </div>

        {favoritePartners.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-5 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-destructive" /> Favorite Partners
            </h3>
            <div className="space-y-2">
              {favoritePartners.map((p) => p && (
                <div key={p.id} className="flex items-center gap-3">
                  <InitialAvatar name={p.name} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.completedJourneys} journeys · {p.rating} ⭐</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <button
            onClick={() => { toggleLargeText(); toast('Text size toggled') }}
            className="w-full bg-card rounded-xl px-4 py-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors border border-border mb-2"
          >
            <Accessibility className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Accessibility</p>
              <p className="text-xs text-muted-foreground">
                {largeText ? 'Large text ON' : 'Large text OFF'}{highContrast ? ' · High contrast' : ''}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
          </button>

          <button
            onClick={() => setShowLang(!showLang)}
            className="w-full bg-card rounded-xl px-4 py-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors border border-border mb-2"
          >
            <Globe className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Language</p>
              <p className="text-xs text-muted-foreground">{langNames[locale]}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
          </button>

          {showLang && (
            <div className="bg-card rounded-2xl border border-border p-3 mb-2 grid grid-cols-2 gap-2">
              {(Object.entries(langNames) as [LangCode, string][]).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => { setLocale(code); setShowLang(false) }}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    locale === code ? 'bg-accent text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <button
            className="w-full bg-card rounded-xl px-4 py-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors border border-border mb-2"
          >
            <Heart className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Preferences</p>
              <p className="text-xs text-muted-foreground">Support partner, language</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
          </button>

          <button
            className="w-full bg-card rounded-xl px-4 py-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors border border-border mb-2"
          >
            <Shield className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Trusted Contacts</p>
              <p className="text-xs text-muted-foreground">Emergency contacts</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
          </button>

          <button
            className="w-full bg-card rounded-xl px-4 py-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors border border-border mb-2"
          >
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Payment Methods</p>
              <p className="text-xs text-muted-foreground">Saved cards, UPI</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
          </button>

          <button
            onClick={() => router.push('/terms')}
            className="w-full bg-card rounded-xl px-4 py-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors border border-border mb-2"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Terms & Privacy</p>
              <p className="text-xs text-muted-foreground">Legal, policies</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
          </button>

          <button
            onClick={() => { doLogout(); router.push('/login') }}
            className="w-full bg-card rounded-xl px-4 py-4 flex items-center gap-3 text-left hover:bg-destructive/5 transition-colors border border-border text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Logout</p>
              <p className="text-xs text-muted-foreground">Switch to a different portal</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
          </button>
        </div>
      </div>
    </div>
  )
}


