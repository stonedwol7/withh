'use client'

import { PartnerHeader } from '@/components/shared/partner-nav'
import { useAppStore } from '@/store/use-store'
import { useAuthStore } from '@/store/auth-store'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { useMemo } from 'react'
import { Shield, Star, Globe, Award, ChevronRight } from 'lucide-react'

export default function PartnerProfile() {
  const userName = useAuthStore((s) => s.userName)
  const partners = useAppStore((s) => s.supportPartners)

  const partner = useMemo(
    () => partners.find((p) => userName.includes(p.name.split(' ')[0])) || partners[0],
    [userName, partners]
  )

  if (!partner) {
    return (
      <div>
        <PartnerHeader title="Profile" />
        <div className="px-5 py-20 text-center">
          <p className="text-muted-foreground">Profile not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PartnerHeader title="Profile" />

      <div className="px-5 pt-6 pb-6">
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 text-center">
          <div className="flex justify-center mb-4">
            <InitialAvatar name={partner.name} size="xl" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{partner.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Shield className="w-4 h-4 text-green" />
            <span className="text-sm text-muted-foreground">Verified Support Partner</span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star className="w-4 h-4 text-amber fill-amber" />
            <span className="text-sm font-medium">{partner.rating}</span>
            <span className="text-sm text-muted-foreground">· {partner.completedJourneys} journeys</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 mb-5">
          <p className="text-sm text-foreground/70 leading-relaxed">{partner.bio}</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <Globe className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Languages</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {partner.languages.join(', ')}
              </p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <Award className="w-5 h-5 text-amber" />
            <div>
              <p className="text-xs text-muted-foreground">Specialties</p>
              <p className="text-sm font-medium text-foreground">{partner.specialties.join(', ')}</p>
            </div>
          </div>
        </div>

        <button className="w-full bg-card rounded-xl border border-border p-4 flex items-center justify-between text-left">
          <div>
            <p className="text-sm font-medium text-foreground">Support History</p>
            <p className="text-xs text-muted-foreground">View all completed journeys</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
        </button>
      </div>
    </div>
  )
}
