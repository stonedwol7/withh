'use client'

import { useState } from 'react'
import { CustomerHeader } from '@/components/shared/customer-nav'
import { useAuthStore } from '@/store/auth-store'
import { Gift, Share2, Copy, Check, Users, Award } from 'lucide-react'

export default function ReferralsPage() {
  const userName = useAuthStore((s) => s.userName)
  const [copied, setCopied] = useState(false)
  const referralCode = `${userName.toUpperCase().slice(0, 4)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${referralCode}` : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div>
      <CustomerHeader title="Refer & Earn" />
      <div className="px-5 pt-6 pb-6">
        <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-3xl p-6 mb-6 text-center border border-accent/20">
          <Gift className="w-10 h-10 text-accent mx-auto mb-3" />
          <h2 className="text-xl font-bold text-foreground mb-1">Refer a Friend</h2>
          <p className="text-sm text-muted-foreground mb-4">Give ₹100, get ₹100 when they complete their first journey</p>
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs text-accent font-medium">3 referrals joined this month</span>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 mb-6">
          <p className="text-xs text-muted-foreground mb-2">Your Referral Code</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-xl px-4 py-3">
              <span className="text-lg font-bold text-foreground tracking-wider">{referralCode}</span>
            </div>
            <button
              onClick={handleCopy}
              className="p-3 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors mb-6"
        >
          <Share2 className="w-4 h-4" /> Share Referral Link
        </button>

        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber" /> Rewards
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground">Friend signs up</span>
              <span className="text-xs text-muted-foreground">₹0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-foreground">Friend completes first journey</span>
              <span className="text-sm font-bold text-green">₹100</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">Your first journey credit</span>
              <span className="text-sm font-bold text-green">₹100</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Credits are applied to your next support journey.</p>
        </div>
      </div>
    </div>
  )
}
