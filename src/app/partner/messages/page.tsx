'use client'

import { useRouter } from 'next/navigation'
import { PartnerHeader } from '@/components/shared/partner-nav'
import { useAppStore } from '@/store/use-store'
import { useAuthStore } from '@/store/auth-store'
import { format } from 'date-fns'
import { MessageSquare } from 'lucide-react'

const categoryIcons: Record<string, string> = {
  hospital: '🏥',
  government: '🏛️',
  interview: '💼',
  elderly: '👴',
  event: '🎉',
  other: '📋',
}

export default function PartnerMessages() {
  const router = useRouter()
  const userName = useAuthStore((s) => s.userName)
  const partners = useAppStore((s) => s.supportPartners)
  const partner = partners.find((p) => userName.includes(p.name.split(' ')[0])) || partners[0]
  const partnerId = partner?.id || 'partner-2'
  const requests = useAppStore((s) => s.supportRequests)
  const messages = useAppStore((s) => s.journeyMessages)

  const threads = requests
    .filter((r) => r.assignedPartnerId === partnerId && messages[r.id] && messages[r.id].length > 0)
    .sort((a, b) => {
      const aLast = messages[a.id]?.[messages[a.id].length - 1]?.timestamp || ''
      const bLast = messages[b.id]?.[messages[b.id].length - 1]?.timestamp || ''
      return bLast.localeCompare(aLast)
    })

  return (
    <div>
      <PartnerHeader title="Messages" />
      <div className="px-5 pt-6 pb-6">
        {threads.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No messages yet.</p>
            <p className="text-xs text-muted-foreground/30 mt-1">Messages from your journeys will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((req) => {
              const msgs = messages[req.id] || []
              const lastMsg = msgs[msgs.length - 1]

              return (
                <button
                  key={req.id}
                  onClick={() => router.push(`/partner/messages/${req.id}`)}
                  className="w-full bg-card rounded-2xl border border-border p-4 text-left hover:border-accent/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryIcons[req.category]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {req.category === 'hospital' ? 'Hospital Visit' :
                         req.category === 'government' ? 'Government Office' :
                         req.category === 'interview' ? 'Interview' :
                         req.category === 'elderly' ? 'Elderly Support' :
                         req.category === 'event' ? 'Event' : 'Support'} Journey
                      </p>
                      {lastMsg && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{lastMsg.content}</p>
                      )}
                      {lastMsg && (
                        <p className="text-[10px] text-muted-foreground/40 mt-1">
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
