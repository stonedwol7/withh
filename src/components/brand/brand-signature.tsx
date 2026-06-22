import Image from 'next/image'

export function BrandSignature({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      <Image
        src="/logo-horizontal.png"
        alt="WITHH"
        width={100}
        height={24}
        className="object-contain"
        priority
      />
    </span>
  )
}
