'use client'

import { useState } from 'react'
import { PartnerHeader } from '@/components/shared/partner-nav'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/use-store'
import { Clock, Plus, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
]

export default function PartnerCalendarPage() {
  const userName = useAuthStore((s) => s.userName)
  const partners = useAppStore((s) => s.supportPartners)
  const partner = partners.find((p) => userName.includes(p.name.split(' ')[0])) || partners[0]
  const [slots, setSlots] = useState<{ day: number; start: string; end: string }[]>([])
  const [adding, setAdding] = useState(false)
  const [day, setDay] = useState(1)
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:00')

  const addSlot = () => {
    setSlots((prev) => [...prev, { day, start, end }])
    setAdding(false)
    toast.success('Availability added')
  }

  const removeSlot = (idx: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <PartnerHeader title="My Availability" />
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">Set your weekly availability</p>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Slot
          </button>
        </div>

        {adding && (
          <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Day</label>
              <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm">
                {dayNames.map((name, i) => <option key={i} value={i}>{name}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">From</label>
                <select value={start} onChange={(e) => setStart(e.target.value)} className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm">
                  {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To</label>
                <select value={end} onChange={(e) => setEnd(e.target.value)} className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm">
                  {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm">Cancel</button>
              <button onClick={addSlot} className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-medium">Save</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {dayNames.map((name, dayIdx) => {
            const daySlots = slots.filter((s) => s.day === dayIdx)
            return (
              <div key={dayIdx} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${daySlots.length > 0 ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                    {name}
                  </span>
                  {daySlots.length > 0 && (
                    <span className="text-[10px] bg-green/10 text-green px-2 py-0.5 rounded-full">{daySlots.length} slots</span>
                  )}
                </div>
                {daySlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground/40">Not available</p>
                ) : (
                  <div className="space-y-1.5">
                    {daySlots.map((slot, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                        <span className="text-xs text-foreground flex items-center gap-2">
                          <Clock className="w-3 h-3 text-accent" /> {slot.start} - {slot.end}
                        </span>
                        <button onClick={() => removeSlot(idx)} className="p-1 hover:bg-destructive/10 rounded-lg">
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
