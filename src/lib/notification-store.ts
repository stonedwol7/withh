'use client'

import { create } from 'zustand'

export interface AppNotification {
  id: string
  type: 'sos' | 'status' | 'message' | 'payment' | 'reminder' | 'system'
  title: string
  body: string
  requestId?: string
  read: boolean
  timestamp: string
}

interface NotificationState {
  notifications: AppNotification[]
  sosActive: boolean
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clearNotifications: () => void
  unreadCount: () => number
  triggerSos: (requestId?: string) => void
  clearSos: () => void
}

let notifCounter = 0

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  sosActive: false,
  addNotification: (n) => {
    notifCounter++
    set((state) => ({
      notifications: [
        {
          ...n,
          id: `notif-${notifCounter}-${Date.now()}`,
          read: false,
          timestamp: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    }))
  },
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  clearNotifications: () => set({ notifications: [] }),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
  triggerSos: (requestId) => {
    set({ sosActive: true })
    get().addNotification({
      type: 'sos',
      title: '🚨 SOS Alert',
      body: 'Emergency alert sent to operations team. Help is on the way.',
      requestId,
    })
  },
  clearSos: () => set({ sosActive: false }),
}))
