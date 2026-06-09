'use client'

import { useParams, useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { CustomerHeader } from '@/components/shared/customer-nav'
import { useState } from 'react'
import { ThumbsUp, Heart, Star, Check } from 'lucide-react'

export default function CompletionPage() {
  const params = useParams()
  const router = useRouter()
  const request = useAppStore((s) => s.getRequest(params.id as string))
  const partner = useAppStore((s) => s.getPartnerByRequest(params.id as string))
  const [supported, setSupported] = useState<boolean | null>(null)
  const [useAgain, setUseAgain] = useState<boolean | null>(null)
  const [repeatPartner, setRepeatPartner] = useState<boolean | null>(null)

  if (!request) {
    return (
      <div>
        <CustomerHeader title="Completed" />
        <div className="px-5 py-20 text-center">
          <p className="text-muted-foreground">Request not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <CustomerHeader title="How was it?" />

      <div className="px-5 pt-8 pb-24">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Journey Complete!</h1>
          <p className="text-sm text-muted-foreground">Thank you for choosing WITHH.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-5">
            <p className="text-sm font-medium text-foreground/70 mb-4">Did you feel supported?</p>
            <div className="flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setSupported(val)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                    supported === val
                      ? val ? 'bg-green/10 border-green text-green' : 'bg-destructive/5 border-destructive/30 text-destructive'
                      : 'bg-card border-border text-muted-foreground'
                  }`}
                >
                  {val ? 'Yes, I felt supported' : 'Not really'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5">
            <p className="text-sm font-medium text-foreground/70 mb-4">Would you use WITHH again?</p>
            <div className="flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setUseAgain(val)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                    useAgain === val
                      ? val ? 'bg-green/10 border-green text-green' : 'bg-destructive/5 border-destructive/30 text-destructive'
                      : 'bg-card border-border text-muted-foreground'
                  }`}
                >
                  {val ? 'Yes, definitely' : 'Probably not'}
                </button>
              ))}
            </div>
          </div>

          {partner && (
            <div className="bg-card rounded-2xl border border-border p-5">
              <p className="text-sm font-medium text-foreground/70 mb-4">
                Would you like {partner.name} again?
              </p>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => setRepeatPartner(val)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                      repeatPartner === val
                        ? val ? 'bg-accent/10 border-accent text-accent' : 'bg-muted/50 border-border text-muted-foreground'
                        : 'bg-card border-border text-muted-foreground'
                    }`}
                  >
                    {val ? 'Yes, please' : 'No preference'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => router.push('/customer')}
            className="w-full bg-primary text-white py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
