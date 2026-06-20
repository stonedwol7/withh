'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body className="bg-alabaster text-slate min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-slate mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-6">An unexpected error occurred. Please try again.</p>
          <button
            onClick={reset}
            className="bg-copper text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
