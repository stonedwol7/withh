'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { CustomerHeader } from '@/components/shared/customer-nav'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { format } from 'date-fns'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/constants'
import { Clock, Star, MapPin, Shield, Heart, Award } from 'lucide-react'

export default function JourneyRecapPage() {
  const params = useParams()
  const router = useRouter()
  const request = useAppStore((s) => s.getRequest(params.id as string))
  const partner = useAppStore((s) => s.getPartnerByRequest(params.id as string))
  const messages = useAppStore((s) => s.getMessagesByRequest(params.id as string))

  if (!request || request.status !== 'completed') {
    return (
      <div>
        <CustomerHeader title="Journey Recap" />
        <div className="px-5 py-20 text-center text-muted-foreground text-sm">
          Journey recap available after completion
        </div>
      </div>
    )
  }

  const durationHours = request.duration === 'more-4' ? 5 : request.duration === '2-4' ? 3 : 1.5
  const systemMessages = messages.filter((m) => m.from === 'system')
  const partnerMessage = messages.find((m) => m.from === 'partner')

  return (
    <div>
      <CustomerHeader title="Journey Recap" />
      <div className="px-5 pt-6 pb-6">
        <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-3xl p-6 text-center mb-6 border border-accent/20">
          <div className="w-16 h-16 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-3">
            <Award className="w-8 h-8 text-green" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Journey Complete!</h2>
          <p className="text-sm text-muted-foreground">
            {format(new Date(request.date), 'MMMM dd, yyyy')}
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{CATEGORY_ICONS[request.category]}</span>
            <div>
              <h3 className="text-base font-bold text-foreground">{CATEGORY_LABELS[request.category]}</h3>
              <p className="text-xs text-muted-foreground">{request.date} at {request.time}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <Clock className="w-5 h-5 text-accent mx-auto mb-1.5" />
            <p className="text-lg font-bold text-foreground">{durationHours}h</p>
            <p className="text-[10px] text-muted-foreground">Duration</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <MapPin className="w-5 h-5 text-green mx-auto mb-1.5" />
            <p className="text-lg font-bold text-foreground">2</p>
            <p className="text-[10px] text-muted-foreground">Locations</p>
          </div>
        </div>

        {partner && (
          <div className="bg-card rounded-2xl border border-border p-5 mb-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber" /> Your Support Partner
            </h3>
            <div className="flex items-center gap-3">
              <InitialAvatar name={partner.name} size="md" />
              <div>
                <p className="text-sm font-bold text-foreground">{partner.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Star className="w-3 h-3 text-amber fill-amber" />
                  <span className="text-xs text-muted-foreground">{partner.rating}</span>
                  <Shield className="w-3 h-3 text-green ml-1" />
                  <span className="text-xs text-muted-foreground">Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {partnerMessage && (
          <div className="bg-card rounded-2xl border border-border p-5 mb-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {partner?.name || 'Partner'} said
            </h3>
            <p className="text-sm text-foreground italic">&ldquo;{partnerMessage.content}&rdquo;</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/customer/completion/${request.id}`)}
            className="flex-1 py-3 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
          >
            <Star className="w-4 h-4 inline mr-1.5" /> Rate Journey
          </button>
          <button
            onClick={() => router.push(`/customer/invoice/${request.id}`)}
            className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            View Invoice
          </button>
        </div>
      </div>
    </div>
  )
}
