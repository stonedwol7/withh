import Image from 'next/image'

export function BrandWordmark({ className = '', size = 'sm' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const dimensions = {
    sm: { width: 80, height: 20 },
    md: { width: 120, height: 30 },
    lg: { width: 160, height: 40 },
    xl: { width: 240, height: 60 },
  }

  const dim = dimensions[size]

  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      <Image
        src="/logo-horizontal.png"
        alt="WITHH"
        width={dim.width}
        height={dim.height}
        className="object-contain"
        priority
      />
    </span>
  )
}
