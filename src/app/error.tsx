'use client'

import { useEffect } from 'react'
import { BrandMark } from '@/components/brand/brand-mark'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <BrandMark size={20} className="text-accent mx-auto mb-4 opacity-40" />
      <h1 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
        We encountered an unexpected issue. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
      >
        Try Again
      </button>
    </div>
  )
}
