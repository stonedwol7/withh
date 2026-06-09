export function BrandMark({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="6" width="11" height="28" rx="4" fill="currentColor" opacity="0.5" />
      <rect x="17" y="2" width="11" height="32" rx="4" fill="currentColor" opacity="0.9" />
    </svg>
  )
}
