import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3" role="status" aria-live="polite">
      <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
