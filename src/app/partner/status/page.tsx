'use client'

import { PartnerHeader } from '@/components/shared/partner-nav'
import { Shield, CheckCircle, Clock, AlertTriangle, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/use-store'
import Link from 'next/link'

const bgStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'text-amber bg-amber/10', icon: Clock },
  verified: { label: 'Verified', color: 'text-green bg-green/10', icon: CheckCircle },
  failed: { label: 'Action Needed', color: 'text-destructive bg-destructive/10', icon: AlertTriangle },
  not_submitted: { label: 'Not Submitted', color: 'text-muted-foreground bg-muted', icon: FileText },
}

export default function StatusTrackerPage() {
  const userName = useAuthStore((s) => s.userName)
  const partners = useAppStore((s) => s.supportPartners)
  const partner = partners.find((p) => userName.includes(p.name.split(' ')[0])) || partners[0]
  const bgStatus = partner.bgCheckStatus || 'not_submitted'
  const config = bgStatusConfig[bgStatus] || bgStatusConfig.not_submitted
  const StatusIcon = config.icon
  const [uploading, setUploading] = useState(false)

  const handleUpload = () => {
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      toast('Document upload coming soon.', {
        description: 'Contact support@withh.in to submit your documents.',
      })
    }, 600)
  }

  return (
    <div>
      <PartnerHeader title="Verification Status" />
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-4 bg-card rounded-2xl border border-border p-5 mb-6">
          <InitialAvatar name={partner.name} size="lg" />
          <div>
            <p className="text-base font-bold text-foreground">{partner.name}</p>
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${config.color}`}>
              <StatusIcon className="w-3 h-3" /> {config.label}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" /> Background Check
          </h3>
          <div className="relative pl-6">
            <div className="absolute left-2.5 top-1 bottom-1 w-0.5 bg-border"></div>
            <div className={`relative pb-5 ${bgStatus === 'not_submitted' || bgStatus === 'pending' ? 'opacity-40' : ''}`}>
              <div className="absolute left-[-18px] top-0.5 w-3 h-3 rounded-full bg-green/20 border-2 border-green"></div>
              <p className="text-sm font-medium text-foreground">Identity Verified</p>
              <p className="text-xs text-muted-foreground mt-0.5">Aadhaar + PAN submitted & verified</p>
            </div>
            <div className={`relative pb-5 ${bgStatus === 'not_submitted' ? 'opacity-40' : ''}`}>
              <div className={`absolute left-[-18px] top-0.5 w-3 h-3 rounded-full border-2 ${bgStatus === 'verified' ? 'bg-green/20 border-green' : 'bg-muted border-muted-foreground/30'}`}></div>
              <p className="text-sm font-medium text-foreground">Background Check</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {bgStatus === 'verified' ? 'Completed - Clear' : bgStatus === 'failed' ? 'Issues found - contact support' : bgStatus === 'pending' ? 'In progress...' : 'Not started'}
              </p>
            </div>
            <div className={`relative ${bgStatus === 'verified' ? '' : 'opacity-40'}`}>
              <div className={`absolute left-[-18px] top-0.5 w-3 h-3 rounded-full border-2 ${bgStatus === 'verified' ? 'bg-green/20 border-green' : 'bg-muted border-muted-foreground/30'}`}></div>
              <p className="text-sm font-medium text-foreground">Ready to Accept</p>
              <p className="text-xs text-muted-foreground mt-0.5">All verifications passed</p>
            </div>
          </div>
        </div>

        {bgStatus === 'not_submitted' && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="block w-full text-center py-3.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 transition-colors disabled:opacity-60"
          >
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Please wait...</> : 'Upload Documents'}
          </button>
        )}

        {bgStatus === 'failed' && (
          <p className="text-xs text-muted-foreground text-center">
            Please contact support at <span className="text-accent">support@withh.in</span> to resolve verification issues.
          </p>
        )}
      </div>
    </div>
  )
}
