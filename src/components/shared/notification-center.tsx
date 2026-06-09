'use client'

import { useState } from 'react'
import { Bell, CheckCheck, X, AlertTriangle, MessageSquare, CreditCard, Clock, Info } from 'lucide-react'
import { useNotificationStore } from '@/lib/notification-store'
import { useRouter } from 'next/navigation'

const typeIcons: Record<string, React.ElementType> = {
  sos: AlertTriangle,
  status: Clock,
  message: MessageSquare,
  payment: CreditCard,
  reminder: Bell,
  system: Info,
}

const typeColors: Record<string, string> = {
  sos: 'text-destructive bg-destructive/10',
  status: 'text-accent bg-accent/10',
  message: 'text-blue bg-blue/10',
  payment: 'text-green bg-green/10',
  reminder: 'text-amber bg-amber/10',
  system: 'text-muted-foreground bg-muted',
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markRead, markAllRead, clearNotifications } = useNotificationStore()
  const router = useRouter()
  const count = unreadCount()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            <div className="flex gap-2">
              {count > 0 && (
                <button onClick={markAllRead} className="text-xs text-accent hover:underline flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => { clearNotifications(); setOpen(false) }} className="text-xs text-muted-foreground hover:underline">
                Clear
              </button>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcons[n.type] || Info
                const color = typeColors[n.type] || typeColors.system
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      markRead(n.id)
                      if (n.requestId) router.push(`/customer/requests/${n.requestId}`)
                      setOpen(false)
                    }}
                    className={`w-full text-left p-4 border-b border-border/50 hover:bg-muted/50 transition-colors ${
                      !n.read ? 'bg-accent/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground/40 mt-1">
                          {new Date(n.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
