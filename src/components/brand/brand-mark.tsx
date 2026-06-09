interface BrandMarkProps {
  size?: number
  className?: string
}

export function BrandMark({ size = 28, className = '' }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.1)}
      viewBox="0 0 28 31"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="1" y="5" width="10" height="25" rx="4" fill="currentColor" opacity="0.9" />
      <rect x="16" y="1" width="10" height="29" rx="4" fill="currentColor" opacity="0.45" />
    </svg>
  )
}
