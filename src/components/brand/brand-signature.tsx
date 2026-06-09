import { BrandMark } from './brand-mark'
import { BrandWordmark } from './brand-wordmark'

export function BrandSignature({ className = '', markSize = 18 }: { className?: string; markSize?: number }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandMark size={markSize} className="text-accent" />
      <BrandWordmark size="sm" />
    </span>
  )
}
