'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { CustomerHeader } from '@/components/shared/customer-nav'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const categoryEmojis: Record<string, string> = {
  hospital: '🏥', government: '🏛️', interview: '💼', elderly: '👴', event: '🎉', other: '📋',
}

export default function CalendarPage() {
  const router = useRouter()
  const requests = useAppStore((s) => s.supportRequests)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = useMemo(() => eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  }), [currentMonth])

  const startDay = getDay(days[0])

  const requestsByDate = useMemo(() => {
    const map: Record<string, typeof requests> = {}
    for (const r of requests) {
      const key = r.date
      if (!map[key]) map[key] = []
      map[key].push(r)
    }
    return map
  }, [requests])

  return (
    <div>
      <CustomerHeader title="Calendar" showBack />
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="p-2 rounded-xl hover:bg-muted"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-foreground">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button
            onClick={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="p-2 rounded-xl hover:bg-muted"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayRequests = requestsByDate[dateStr] || []
            const active = isToday(day)

            return (
              <button
                key={dateStr}
                onClick={() => {
                  if (dayRequests.length > 0) {
                    router.push(`/customer/requests`)
                  }
                }}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all ${
                  active ? 'bg-accent text-white font-bold' : 'hover:bg-muted'
                } ${dayRequests.length > 0 ? 'ring-1 ring-accent/30' : ''}`}
              >
                <span className={active ? 'text-white' : 'text-foreground'}>{format(day, 'd')}</span>
                {dayRequests.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayRequests.slice(0, 3).map((r) => (
                      <span key={r.id} className="text-[8px]">{categoryEmojis[r.category] || '📋'}</span>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {requests.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Upcoming</h3>
            {requests
              .filter((r) => r.date >= format(new Date(), 'yyyy-MM-dd') && r.status !== 'cancelled' && r.status !== 'completed')
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 5)
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => router.push(`/customer/requests/${r.id}`)}
                  className="w-full bg-card rounded-2xl border border-border p-4 text-left hover:border-accent/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryEmojis[r.category] || '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{format(parseISO(r.date), 'MMM dd')} at {r.time}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.destination}</p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
