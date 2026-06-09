'use client'

import { PartnerHeader } from '@/components/shared/partner-nav'
import { useAppStore } from '@/store/use-store'
import { useAuthStore } from '@/store/auth-store'
import { useMemo } from 'react'
import { Wallet, Clock, DollarSign } from 'lucide-react'

export default function PartnerEarnings() {
  const userName = useAuthStore((s) => s.userName)
  const partners = useAppStore((s) => s.supportPartners)
  const allEarnings = useAppStore((s) => s.partnerEarnings)

  const partnerId = useMemo(() => {
    const p = partners.find((p) => userName.includes(p.name.split(' ')[0]))
    return p?.id || 'partner-2'
  }, [userName, partners])

  const earnings = useMemo(
    () => allEarnings.filter((e) => e.partnerId === partnerId),
    [allEarnings, partnerId]
  )

  const totalEarned = earnings.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)
  const pendingAmount = earnings.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)

  return (
    <div>
      <PartnerHeader title="Earnings" />

      <div className="px-5 pt-6 pb-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-2xl border border-border p-5">
            <DollarSign className="w-6 h-6 text-green mb-2" />
            <p className="text-2xl font-bold text-foreground">₹{totalEarned}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-5">
            <Clock className="w-6 h-6 text-amber mb-2" />
            <p className="text-2xl font-bold text-foreground">₹{pendingAmount}</p>
            <p className="text-xs text-muted-foreground">Pending Payout</p>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Payout History</h2>
        {earnings.length === 0 ? (
          <div className="text-center py-10">
            <Wallet className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No earnings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {earnings.map((earn) => (
              <div key={earn.id} className="bg-card rounded-xl border border-border p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-foreground">Support Journey</p>
                  <p className="text-xs text-muted-foreground">
                    {earn.status === 'paid' ? 'Paid out' : 'Pending'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">₹{earn.amount}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    earn.status === 'paid' ? 'bg-green/10 text-green' : 'bg-amber/10 text-amber'
                  }`}>
                    {earn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
