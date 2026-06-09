'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { format } from 'date-fns'
import { useEffect, useMemo } from 'react'
import { Shield, Star, CheckCircle, Globe, Award, User, Brain, ArrowUp } from 'lucide-react'
import { AiInsightsPanel } from '@/components/ops/ai-insights-panel'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { toast } from 'sonner'

const categoryLabels: Record<string, string> = {
  hospital: 'Hospital Visit',
  government: 'Government Office',
  appointment: 'Appointment',
  elderly: 'Elderly Support',
  event: 'Event',
  other: 'Other',
}

export default function OpsMatchingDetail() {
  const params = useParams()
  const router = useRouter()
  const request = useAppStore((s) => s.getRequest(params.id as string))
  const allPartners = useAppStore((s) => s.supportPartners)
  const partners = useMemo(() => allPartners.filter((p) => p.available), [allPartners])
  const assignPartner = useAppStore((s) => s.assignPartner)
  const updateStatus = useAppStore((s) => s.updateRequestStatus)
  const recommendation = useAppStore((s) => s.aiRecommendations[params.id as string])
  const runMatching = useAppStore((s) => s.runAiMatching)

  useEffect(() => {
    if (!recommendation && request) {
      runMatching(request.id)
    }
  }, [request?.id])

  if (!request) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Request not found.</p>
      </div>
    )
  }

  const available = partners.filter((p) => {
    if (request.genderPreference !== 'no-preference' && p.gender !== request.genderPreference) return false
    return true
  })

  const sortedPartners = [...available].sort((a, b) => {
    if (!recommendation) return 0
    const aScore = recommendation.alternatives.find((alt) => alt.partnerId === a.id)
    const bScore = recommendation.alternatives.find((alt) => alt.partnerId === b.id)
    const aRec = recommendation.recommended?.partnerId === a.id
    const bRec = recommendation.recommended?.partnerId === b.id
    if (aRec) return -1
    if (bRec) return 1
    return (bScore?.score || 0) - (aScore?.score || 0)
  })

  const getScore = (partnerId: string) => {
    if (recommendation?.recommended?.partnerId === partnerId) return recommendation.recommended.score
    return recommendation?.alternatives?.find((a) => a.partnerId === partnerId)?.score
  }

  const getReasons = (partnerId: string) => {
    if (recommendation?.recommended?.partnerId === partnerId) return recommendation.recommended.reasons
    return recommendation?.alternatives?.find((a) => a.partnerId === partnerId)?.reasons
  }

  const handleAssign = (partnerId: string) => {
    const partner = partners.find((p) => p.id === partnerId)
    assignPartner(request.id, partnerId)
    updateStatus(request.id, 'partner-assigned')
    toast.success(`${partner?.name || 'Partner'} assigned to this request.`)
    setTimeout(() => router.push('/ops'), 800)
  }

  return (
    <div className="p-6">
      <button onClick={() => router.back()} className="text-sm text-accent font-medium mb-4 hover:underline">
        ← Back to Matching
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Request Details</h1>
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {categoryLabels[request.category]}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {format(new Date(request.date), 'EEEE, MMMM dd, yyyy')} at {request.time}
              </p>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Meeting Point</p>
                  <p className="text-foreground/70">{request.meetingLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="text-foreground/70 font-medium">{request.destination}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-foreground/70">{request.duration === 'under-2' ? 'Under 2 hrs' : request.duration === '2-4' ? '2-4 hrs' : '4+ hrs'}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                    {request.genderPreference === 'no-preference' ? 'No gender pref' : request.genderPreference}
                  </span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    {request.languagePreference}
                  </span>
                </div>
              </div>

              {request.description && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground/70">{request.description}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Available Partners</h2>
              {recommendation?.recommended && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-accent" />
                  AI-sorted by match score
                </span>
              )}
            </div>

            <div className="space-y-4">
              {sortedPartners.map((partner) => {
                const score = getScore(partner.id)
                const reasons = getReasons(partner.id)
                const isRecommended = recommendation?.recommended?.partnerId === partner.id

                return (
                  <div
                    key={partner.id}
                    className={`bg-card rounded-xl border p-5 transition-all ${
                      isRecommended
                        ? 'border-accent ring-1 ring-accent/20'
                        : 'border-border'
                    }`}
                  >
                    {isRecommended && (
                      <div className="flex items-center gap-1.5 mb-3 text-accent">
                        <Brain className="w-4 h-4" />
                        <span className="text-xs font-semibold">AI Recommended</span>
                        <span className="text-xs font-bold ml-auto">{score}% match</span>
                      </div>
                    )}

                    <div className="flex items-start gap-4 mb-4">
                      <InitialAvatar name={partner.name} size="md" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-foreground">{partner.name}</p>
                          <Shield className="w-3.5 h-3.5 text-green" />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber fill-amber" />
                            <span className="text-xs text-muted-foreground">{partner.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{partner.completedJourneys} journeys</span>
                          {score !== undefined && (
                            <span className="text-xs font-medium text-accent">{score}% match</span>
                          )}
                        </div>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {partner.languages.map((l) => (
                            <span key={l} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded capitalize">{l}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">{partner.bio}</p>

                    <div className="flex gap-1 flex-wrap mb-3">
                      {partner.specialties.map((s) => (
                        <span key={s} className="text-[10px] bg-accent/5 text-accent px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>

                    {reasons && reasons.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-4">
                        <p className="text-[10px] text-muted-foreground mb-1">Why this match</p>
                        <div className="space-y-1">
                          {reasons.map((r, i) => (
                            <p key={i} className="text-[11px] text-muted-foreground">{r}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleAssign(partner.id)}
                      className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
                    >
                      Assign {partner.name.split(' ')[0]}
                    </button>
                  </div>
                )
              })}

              {available.length === 0 && (
                <div className="text-center py-10 bg-card rounded-xl border border-border">
                  <User className="w-10 h-10 text-border mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No matching partners available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AiInsightsPanel requestId={request.id} />

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Matching Priority</h3>
            <div className="space-y-2">
              {[
                { num: 1, label: 'Availability' },
                { num: 2, label: 'Partner Preference' },
                { num: 3, label: 'Language' },
                { num: 4, label: 'Distance' },
                { num: 5, label: 'Experience' },
                { num: 6, label: 'Repeat Partner' },
              ].map((p) => (
                <div key={p.num} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-medium">
                    {p.num}
                  </span>
                  <span className="text-xs text-muted-foreground">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
