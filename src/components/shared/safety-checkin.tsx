'use client'

import { useEffect, useState, useCallback } from 'react'
import { useNotificationStore } from '@/lib/notification-store'
import { Shield, Check } from 'lucide-react'

interface SafetyCheckinProps {
  requestId: string
  durationHours: number
  completed: boolean
  onCheckinMissed?: () => void
}

export function SafetyCheckin({ requestId, durationHours, completed, onCheckinMissed }: SafetyCheckinProps) {
  const [checkinAt, setCheckinAt] = useState<Date | null>(null)
  const [acknowledged, setAcknowledged] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const { addNotification } = useNotificationStore()

  const scheduleCheckin = useCallback(() => {
    if (completed || durationHours < 1) return
    const checkinMinutes = Math.min(durationHours * 60 / 2, 120)
    const time = new Date(Date.now() + checkinMinutes * 60 * 1000)
    setCheckinAt(time)
  }, [durationHours, completed])

  useEffect(() => {
    scheduleCheckin()
  }, [scheduleCheckin])

  useEffect(() => {
    if (!checkinAt || completed) return
    const timeout = setTimeout(() => {
      setShowPrompt(true)
      addNotification({
        type: 'reminder',
        title: 'Safety Check-in',
        body: 'Are you safe? Please confirm your well-being.',
        requestId,
      })
    }, checkinAt.getTime() - Date.now())
    return () => clearTimeout(timeout)
  }, [checkinAt, completed, requestId, addNotification])

  const handleAcknowledge = () => {
    setAcknowledged(true)
    setShowPrompt(false)
    addNotification({
      type: 'reminder',
      title: 'Check-in Confirmed',
      body: 'Thank you for confirming. You are safe.',
      requestId,
    })
    scheduleCheckin()
  }

  const handleMissed = () => {
    setShowPrompt(false)
    addNotification({
      type: 'sos',
      title: '🚨 Missed Check-in',
      body: 'Customer did not respond to safety check-in. Alerting operations team.',
      requestId,
    })
    onCheckinMissed?.()
  }

  if (completed || durationHours < 1) return null

  return (
    <>
      {showPrompt && !acknowledged && (
        <div className="fixed inset-0 z-[150] bg-black/50 flex items-end sm:items-center justify-center p-5">
          <div className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Safety Check-in</h2>
              <p className="text-sm text-muted-foreground mb-4">Are you safe right now?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleMissed}
                  className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium text-sm"
                >
                  I need help
                </button>
                <button
                  onClick={handleAcknowledge}
                  className="flex-1 py-3 rounded-xl bg-green text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  I&apos;m safe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
