'use client'

import { CustomerBottomNav } from '@/components/shared/customer-nav'
import { AuthGuard } from '@/components/shared/auth-guard'
import { useScheduledReminders } from '@/lib/reminders'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  useScheduledReminders()

  return (
    <AuthGuard requiredRole="customer">
      <div className="max-w-lg mx-auto bg-background min-h-screen relative">
        <div className="pb-20">{children}</div>
        <CustomerBottomNav />
      </div>
    </AuthGuard>
  )
}
