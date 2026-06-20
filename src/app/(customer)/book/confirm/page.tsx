'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

export default function BookConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      return
    }
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
      <div className="min-h-screen bg-alabaster flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <p className="text-lg font-bold text-slate mb-2">Booking failed</p>
          <p className="text-sm text-muted-foreground mb-6">Your booking could not be saved. Please try again.</p>
          <button onClick={() => router.push('/book')} className="bg-copper text-white px-6 py-3 rounded-xl text-sm font-medium">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-alabaster flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <CheckCircle className="w-12 h-12 text-green mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate mb-2">Booking confirmed!</h1>
        <p className="text-sm text-muted-foreground mb-6">Redirecting to your dashboard in {countdown}...</p>
        <Loader2 className="w-4 h-4 animate-spin text-copper mx-auto" />
      </div>
    </div>
  )
}
