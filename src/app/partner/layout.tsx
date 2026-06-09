'use client'

import { PartnerBottomNav, PartnerHeader } from '@/components/shared/partner-nav'
import { AuthGuard } from '@/components/shared/auth-guard'

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="partner">
      <div className="max-w-lg mx-auto bg-background min-h-screen relative">
        <div className="pb-20">{children}</div>
        <PartnerBottomNav />
      </div>
    </AuthGuard>
  )
}
