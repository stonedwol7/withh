import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'
import type { RequestStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: RequestStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[status] || 'bg-muted text-muted-foreground'} ${className}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}
