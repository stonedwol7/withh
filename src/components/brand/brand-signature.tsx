import { BrandMark } from './brand-mark'
import { BrandWordmark } from './brand-wordmark'

interface BrandSignatureProps {
  size?: 'sm' | 'md' | 'lg'
  showMark?: boolean
  className?: string
}

const markSizes = { sm: 16, md: 22, lg: 28 }
const gapSizes = { sm: 'gap-1.5', md: 'gap-2', lg: 'gap-2.5' }

export function BrandSignature({ size = 'md', showMark = true, className = '' }: BrandSignatureProps) {
  return (
    <span className={`inline-flex items-center ${gapSizes[size]} ${className}`}>
      {showMark && (
        <BrandMark size={markSizes[size]} className="text-foreground" />
      )}
      <BrandWordmark size={size} />
    </span>
  )
}
