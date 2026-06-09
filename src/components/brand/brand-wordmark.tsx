interface BrandWordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-[44px]',
}

export function BrandWordmark({ size = 'md', className = '' }: BrandWordmarkProps) {
  return (
    <span className={`font-bold tracking-tight text-foreground leading-none ${sizes[size]} ${className}`}>
      WITHH
    </span>
  )
}
