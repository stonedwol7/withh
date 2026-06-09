export function InitialAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  const colors = [
    'bg-blue/10 text-blue',
    'bg-green/10 text-green',
    'bg-amber/10 text-amber',
    'bg-red/10 text-red',
    'bg-purple/10 text-purple',
    'bg-pink/10 text-pink',
    'bg-teal/10 text-teal',
    'bg-orange/10 text-orange',
  ]

  const colorIdx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length

  return (
    <div
      className={`${sizeClasses[size]} ${colors[colorIdx]} rounded-xl flex items-center justify-center font-bold shrink-0`}
    >
      {initials}
    </div>
  )
}
