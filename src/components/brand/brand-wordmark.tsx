export function BrandWordmark({ className = '', size = 'lg' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'text-sm font-bold tracking-[0.15em]',
    md: 'text-lg font-bold tracking-[0.2em]',
    lg: 'text-2xl font-bold tracking-[0.25em]',
    xl: 'text-5xl font-bold tracking-[0.15em]',
  }

  return (
    <span className={`${sizeClasses[size]} text-foreground select-none ${className}`}>
      WITHH
    </span>
  )
}
