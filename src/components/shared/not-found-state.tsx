import { FileQuestion } from 'lucide-react'
import Link from 'next/link'

interface NotFoundStateProps {
  message: string
  backHref?: string
  backLabel?: string
}

export function NotFoundState({ message, backHref = '/', backLabel = 'Go Home' }: NotFoundStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileQuestion className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold text-foreground mb-1">{message}</p>
      <Link
        href={backHref}
        className="mt-4 text-sm text-accent font-medium hover:underline"
      >
        {backLabel}
      </Link>
    </div>
  )
}
