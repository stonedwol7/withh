'use client'

import { useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/use-store'
import { useNotificationStore } from '@/lib/notification-store'

export function useScheduledReminders() {
  const requests = useAppStore((s) => s.supportRequests)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  const scheduleNotification = useCallback((title: string, body: string, time: Date) => {
    const delay = time.getTime() - Date.now()
    if (delay <= 0 || delay > 86400000 * 7) return

    setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon-512.png' })
      }
    }, delay)
  }, [])

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  useEffect(() => {
    if (!('Notification' in window)) return

    const now = Date.now()

    requests
      .filter((r) => {
        if (r.status === 'completed' || r.status === 'cancelled') return false
        const reqDate = new Date(`${r.date}T${r.time}`)
        return reqDate.getTime() > now
      })
      .forEach((r) => {
        const reqDate = new Date(`${r.date}T${r.time}`)

        // 24h before
        const dayBefore = new Date(reqDate.getTime() - 86400000)
        if (dayBefore.getTime() > now) {
          scheduleNotification(
            'Upcoming Journey Tomorrow',
            `${r.category} journey at ${r.time}. Your partner will meet you at your location.`,
            dayBefore
          )
        }

        // 1h before
        const hourBefore = new Date(reqDate.getTime() - 3600000)
        if (hourBefore.getTime() > now) {
          setTimeout(() => {
            addNotification({
              type: 'reminder',
              title: 'Journey Starting Soon',
              body: `Your ${r.category} support starts in 1 hour. Get ready!`,
              requestId: r.id,
            })
          }, hourBefore.getTime() - Date.now())
        }
      })
  }, [requests, addNotification, scheduleNotification])
}
