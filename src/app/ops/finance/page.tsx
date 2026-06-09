'use client'

import { useAppStore } from '@/store/use-store'
import { format } from 'date-fns'
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function OpsFinance() {
  const records = useAppStore((s) => s.financeRecords)

  const totalRevenue = records.reduce((sum, r) => sum + r.revenue, 0)
  const totalPayouts = records.reduce((sum, r) => sum + r.partnerPayout, 0)
  const totalCustomerPaid = records.reduce((sum, r) => sum + r.customerPayment, 0)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Finance</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-foreground">₹{totalRevenue}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Net after payouts</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-5 h-5 text-accent" />
            <span className="text-xs text-muted-foreground">Customer Payments</span>
          </div>
          <p className="text-2xl font-bold text-foreground">₹{totalCustomerPaid}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="w-5 h-5 text-amber" />
            <span className="text-xs text-muted-foreground">Partner Payouts</span>
          </div>
          <p className="text-2xl font-bold text-foreground">₹{totalPayouts}</p>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Transaction History</h2>
      {records.length === 0 ? (
        <div className="text-center py-16">
          <DollarSign className="w-12 h-12 text-border mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Date</th>
                <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Request</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Customer Paid</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Partner Payout</th>
                <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Revenue</th>
                <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id} className="border-b border-border/50">
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(rec.createdAt), 'MMM dd')}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{rec.requestId}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium">₹{rec.customerPayment}</td>
                  <td className="px-4 py-3 text-xs text-right text-muted-foreground">₹{rec.partnerPayout}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium text-green">₹{rec.revenue}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      rec.status === 'completed' ? 'bg-green/10 text-green' : 'bg-red/10 text-red'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
