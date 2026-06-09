'use client'

import { useRouter } from 'next/navigation'
import { CustomerHeader } from '@/components/shared/customer-nav'
import { useAppStore } from '@/store/use-store'
import { format } from 'date-fns'
import { MessageSquare } from 'lucide-react'

const categoryIcons: Record<string, string> = {
  hospital: '🏥',
  government: '🏛️',
  appointment: '📅',
  elderly: '👴',
  event: '🎉',
  other: '📋',
}

export default function CustomerMessages() {
  const router = useRouter()
  const requests = useAppStore((s) => s.supportRequests)
  const messages = useAppStore((s) => s.journeyMessages)

  const threads = requests.filter((r) => messages[r.id] && messages[r.id].length > 0)

  return (
    <div>
      <CustomerHeader title="Messages" />

      <div className="px-5 pt-6 pb-6">
        {threads.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No messages yet.</p>
            <p className="text-xs text-muted-foreground/30 mt-1">Your journey messages will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((req) => {
              const msgs = messages[req.id] || []
              const lastMsg = msgs[msgs.length - 1]

              return (
                <button
                  key={req.id}
                  onClick={() => router.push(`/customer/messages/${req.id}`)}
                  className="w-full bg-card rounded-2xl border border-border p-4 text-left hover:border-accent/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryIcons[req.category]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {req.category === 'hospital' ? 'Hospital Visit' :
                         req.category === 'government' ? 'Government Office' :
                         req.category === 'appointment' ? 'Appointment' :
                         req.category === 'elderly' ? 'Elderly Support' :
                         req.category === 'event' ? 'Event' : 'Support'} Journey
                      </p>
                      {lastMsg && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{lastMsg.content}</p>
                      )}
                      {lastMsg && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(new Date(lastMsg.timestamp), 'MMM dd, h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
