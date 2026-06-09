'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { CustomerHeader } from '@/components/shared/customer-nav'
import { StatusTimeline } from '@/components/shared/status-timeline'
import { StatusBadge } from '@/components/shared/status-badge'
import { NotFoundState } from '@/components/shared/not-found-state'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { SosButton } from '@/components/shared/sos-button'
import { SafetyCheckin } from '@/components/shared/safety-checkin'
import { ShareJourney } from '@/components/shared/share-journey'
import { CardSkeleton } from '@/components/shared/skeleton'
import { CATEGORY_ICONS, CATEGORY_LABELS, PRICING } from '@/lib/constants'
import { format } from 'date-fns'
import { Phone, MessageCircle, Shield, Star, CheckCircle, XCircle, Calendar, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

export default function RequestDetail() {
  const params = useParams()
  const router = useRouter()
  const request = useAppStore((s) => s.getRequest(params.id as string))
  const partner = useAppStore((s) => s.getPartnerByRequest(params.id as string))
  const match = useAppStore((s) => s.getMatchByRequest(params.id as string))
  const payment = useAppStore((s) => s.getPaymentByRequest(params.id as string))
  const messages = useAppStore((s) => s.getMessagesByRequest(params.id as string))
  const confirmMatch = useAppStore((s) => s.confirmMatch)
  const processPayment = useAppStore((s) => s.processPayment)
  const submitRequest = useAppStore((s) => s.submitRequest)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 200)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return (
      <div>
        <CustomerHeader title="Support Journey" />
        <div className="px-5 pt-6 pb-24 space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div>
        <CustomerHeader title="Request" />
        <NotFoundState message="Request not found" backHref="/customer/requests" backLabel="View all requests" />
      </div>
    )
  }

  const isAwaitingConfirmation = request.status === 'partner-assigned'
  const isConfirmed = ['confirmed', 'partner-en-route', 'partner-arrived', 'in-progress', 'completed'].includes(request.status)
  const isActive = ['partner-en-route', 'partner-arrived', 'in-progress'].includes(request.status)
  const isCompleted = request.status === 'completed'
  const needsPayment = isConfirmed && !payment

  const handleConfirmMatch = () => {
    if (!match) return
    confirmMatch(match.id)
    processPayment(request.id)
    toast.success('Match confirmed! Payment successful.')
  }

  const handleRequestDifferentMatch = async () => {
    toast.info('Requesting a different match...')
    await submitRequest()
    toast.success('New request created. The ops team will find a new match.')
    router.push('/customer/requests')
  }

  const isSensitive = ['hospital', 'interview', 'elderly'].includes(request.category)
  const amount = isSensitive ? PRICING.sensitive : PRICING.standard

  const durationHours = request.duration === 'more-4' ? 5 : request.duration === '2-4' ? 3 : 1.5

  const handleQuickRebook = () => {
    const draft = {
      category: request.category,
      meetingLocation: request.meetingLocation,
      destination: request.destination,
      duration: request.duration,
      genderPreference: request.genderPreference,
      languagePreference: request.languagePreference,
    }
    const store = useAppStore.getState()
    store.setRequestDraft(draft)
    router.push('/customer/request')
    toast.success('Previous booking copied! Review and submit.')
  }

  return (
    <div>
      <CustomerHeader title="Support Journey" />

      {isActive && (
        <>
          <SosButton requestId={request.id} />
          <SafetyCheckin requestId={request.id} durationHours={durationHours} completed={isCompleted} />
        </>
      )}

      <div className="px-5 pt-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <div />
          <ShareJourney requestId={request.id} />
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 mb-5 animate-fade-in card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <span className="text-2xl">{CATEGORY_ICONS[request.category]}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{CATEGORY_LABELS[request.category]}</h2>
              <p className="text-sm text-muted-foreground">{format(new Date(request.date), 'EEEE, MMMM dd, yyyy')} at {request.time}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-foreground/70">
            <p>📍 {request.meetingLocation}</p>
            <p>🏁 {request.destination}</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 mb-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">Status</h3>
          <div className="flex items-center gap-2 mb-4">
            <StatusBadge status={request.status} />
          </div>
          <StatusTimeline currentStatus={request.status} />
        </div>

        {partner && match && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-5 animate-fade-in card-hover">
            <div className="p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Your Support Partner</h3>

              <div className="flex items-center gap-4 mb-4">
                <InitialAvatar name={partner.name} size="lg" />
                <div>
                  <p className="text-base font-semibold text-foreground">{partner.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-3.5 h-3.5 text-green" />
                    <span className="text-xs text-muted-foreground">Verified Partner</span>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-3 h-3 text-amber fill-amber" />
                      <span className="text-xs text-muted-foreground">{partner.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {partner.languages.map((lang) => (
                  <span key={lang} className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-md capitalize">
                    {lang}
                  </span>
                ))}
                <span className="text-[10px] bg-accent/10 text-accent px-2 py-1 rounded-md font-medium">
                  {partner.completedJourneys} journeys
                </span>
              </div>

              <p className="text-sm text-foreground/70">{partner.bio}</p>
            </div>

            <div className="bg-muted/50 px-5 py-4 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Why WITHH Chose {partner.name}</h4>
              <ul className="space-y-1.5">
                {match.reasonForMatch.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-foreground/70">
                    <CheckCircle className="w-3.5 h-3.5 text-green mt-0.5 shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {isAwaitingConfirmation && !match.customerApproved && (
              <div className="p-5 border-t border-border space-y-3">
                <button
                  onClick={handleConfirmMatch}
                  className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl font-medium hover:opacity-90 transition-all"
                >
                  Confirm Match & Pay · ₹{amount}
                </button>
                <button
                  onClick={handleRequestDifferentMatch}
                  className="w-full bg-card text-muted-foreground py-3 rounded-xl font-medium border border-border hover:bg-muted transition-all"
                >
                  Request Different Match
                </button>
              </div>
            )}
          </div>
        )}

        {!isCompleted && request.status !== 'cancelled' && (
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => router.push(`/customer/requests/${request.id}/cancel`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Cancel
            </button>
            <button
              onClick={() => router.push(`/customer/requests/${request.id}/reschedule`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-accent/30 text-accent text-sm font-medium hover:bg-accent/5 transition-colors"
            >
              <Calendar className="w-4 h-4" /> Reschedule
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => router.push(`/customer/completion/${request.id}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
            >
              <Star className="w-4 h-4" /> Rate Experience
            </button>
            <button
              onClick={handleQuickRebook}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Book Again
            </button>
          </div>
        )}

        {payment && (
          <div className="bg-card rounded-2xl border border-border p-5 mb-5 card-hover">
            <h3 className="text-sm font-semibold text-foreground mb-3">Payment</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount Paid</span>
              <span className="text-base font-semibold">₹{payment.amount}</span>
            </div>
            <p className="text-xs text-green mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Paid successfully
            </p>
          </div>
        )}

        <div className="bg-card rounded-2xl border border-border p-5 mb-5 card-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Journey Messages</h3>
            <button
              onClick={() => router.push(`/customer/messages/${request.id}`)}
              className="text-xs text-accent font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {messages.slice(-3).map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  msg.from === 'system' ? 'bg-accent/10 text-accent' :
                  msg.from === 'partner' ? 'bg-green/10 text-green' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {msg.from === 'system' ? 'W' : msg.from === 'partner' ? 'P' : 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{msg.senderName}</p>
                  <p className="text-xs text-muted-foreground">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-5 py-3 ios-safe-bottom z-40">
          <div className="max-w-lg mx-auto flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all">
              <Phone className="w-4 h-4" /> Call WITHH
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-whatsapp text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
