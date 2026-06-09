'use client'

import { useAppStore } from '@/store/use-store'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { Shield, Star, Phone, Mail, CheckCircle, XCircle } from 'lucide-react'

export default function OpsPartners() {
  const partners = useAppStore((s) => s.supportPartners)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Partners</h1>

      <div className="grid gap-4">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start gap-4 mb-4">
              <InitialAvatar name={partner.name} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-foreground">{partner.name}</p>
                  <Shield className="w-4 h-4 text-green" />
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber fill-amber" />
                    <span className="text-sm text-muted-foreground">{partner.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{partner.completedJourneys} journeys</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    partner.available ? 'bg-green/10 text-green' : 'bg-red/10 text-red'
                  }`}>
                    {partner.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-3">
              {partner.languages.map((l) => (
                <span key={l} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">{l}</span>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mb-4">{partner.bio}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {partner.phone}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> {partner.email}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
