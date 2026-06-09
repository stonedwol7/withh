'use client'

import { useMemo } from 'react'
import { PRICING, CATEGORY_LABELS } from '@/lib/constants'
import type { SupportCategory } from '@/lib/types'
import { IndianRupee, Info } from 'lucide-react'

interface PriceEstimatorProps {
  category?: SupportCategory
  duration?: string
  onProceed?: () => void
}

export function PriceEstimator({ category, duration, onProceed }: PriceEstimatorProps) {
  const estimate = useMemo(() => {
    if (!category) return null
    const rate = (category === 'hospital' || category === 'elderly')
      ? PRICING.sensitive
      : PRICING.standard
    const hrs = duration === 'more-4' ? 4 : duration === '2-4' ? 3 : 1
    const extraHrs = duration === 'more-4' ? hrs - 2 : duration === '2-4' ? hrs - 2 : 0
    const extraFee = Math.max(0, extraHrs) * PRICING.additionalHour
    const total = rate + extraFee
    return { rate, extraHrs: Math.max(0, extraHrs), extraFee, total }
  }, [category, duration])

  if (!estimate) return null

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
      <div className="flex items-center gap-2">
        <IndianRupee className="w-5 h-5 text-accent" />
        <h3 className="font-bold text-foreground text-sm">Price Estimate</h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{category ? CATEGORY_LABELS[category] : 'Support'} base fee</span>
          <span className="font-medium text-foreground">₹{estimate.rate}</span>
        </div>
        {estimate.extraHrs > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Additional time ({estimate.extraHrs} hrs × ₹{PRICING.additionalHour})</span>
            <span className="font-medium text-foreground">+₹{estimate.extraFee}</span>
          </div>
        )}
        <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
          <span>Estimated total</span>
          <span>₹{estimate.total}</span>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-muted text-xs text-muted-foreground">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>Final amount may vary based on actual duration. Additional time is billed at ₹{PRICING.additionalHour}/hr.</p>
      </div>
    </div>
  )
}
