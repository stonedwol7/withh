'use client'

import { useRouter } from 'next/navigation'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <WifiOff className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold text-foreground mb-2">You&apos;re Offline</h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        Don&apos;t worry! Your existing journeys and messages are still accessible. Connect to the internet to submit new requests.
      </p>
      <button
        onClick={() => router.refresh()}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
      >
        <RefreshCw className="w-4 h-4" /> Try Again
      </button>
    </div>
  )
}
