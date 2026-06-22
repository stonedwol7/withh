import Image from 'next/image'

export function BrandMark({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <span className={className} style={{ width: size, height: size }}>
      <Image
        src="/icon-512.svg"
        alt="WITHH"
        width={size}
        height={size}
        className="object-contain"
      />
    </span>
  )
}
