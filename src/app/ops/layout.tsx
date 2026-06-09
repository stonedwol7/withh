'use client'

import { OpsSidebar } from '@/components/shared/ops-nav'
import { AuthGuard } from '@/components/shared/auth-guard'

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="ops">
      <div className="flex min-h-screen bg-background">
        <OpsSidebar />
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </div>
    </AuthGuard>
  )
}
