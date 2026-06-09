interface SectionHeaderProps {
  title: string
  className?: string
}

export function SectionHeader({ title, className = '' }: SectionHeaderProps) {
  return (
    <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 ${className}`}>
      {title}
    </p>
  )
}
