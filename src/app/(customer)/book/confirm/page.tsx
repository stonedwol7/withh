'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, Sparkles } from 'lucide-react'

export default function BookConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) return
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router, searchParams])

  const error = searchParams.get('error')

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-foreground mb-2">Booking failed</p>
          <p className="text-sm text-muted-foreground mb-6">Your booking could not be saved. Please try again.</p>
          <button onClick={() => router.push('/book')} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-1">Your Anchor is secured!</h1>
        <p className="text-sm text-muted-foreground mb-2">Redirecting to your dashboard in {countdown}...</p>
        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground/40">
          <Sparkles className="w-3 h-3" /> You&apos;re never alone.
        </div>
        <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto mt-6" />
      </div>
    </div>
  )
}
