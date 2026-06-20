'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock, MapPin, User, Send, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'
import { toast } from 'sonner'

type Booking = Database['public']['Tables']['bookings']['Row']
type Message = Database['public']['Tables']['messages']['Row']

export default function ActiveMissionPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [showChat, setShowChat] = useState(true)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const chatEnd = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    async function init() {
      const bookingId = (await params).bookingId

      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        router.replace('/login')
        return
      }

      const { data: b, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (error || !b) {
        toast.error('Mission not found')
        router.replace('/dashboard')
        return
      }

      setBooking(b)

      if (b.customer_id !== auth.user.id && b.partner_id !== auth.user.id) {
        toast.error('Access denied')
        router.replace('/dashboard')
        return
      }

      // Fetch customer name
      const { data: customerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', b.customer_id)
        .single()

      setCustomerName(customerProfile?.full_name || 'Customer')

      // Fetch messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true })

      if (msgs) setMessages(msgs)

      setLoading(false)

      // Realtime subscription
      const channel = supabase
        .channel(`booking-${bookingId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        }, (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    init()
  }, [supabase, router, params])

  // Live timer
  useEffect(() => {
    if (!booking?.started_at) return
    const start = new Date(booking.started_at).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [booking?.started_at])

  // beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h > 0 ? `${h}h ` : ''}${m}m ${sec}s`
  }

  const sendMessage = async () => {
    const msg = input.trim()
    if (!msg || !booking) return
    setSending(true)

    const { error } = await supabase.from('messages').insert({
      booking_id: booking.id,
      sender_id: (await supabase.auth.getUser()).data.user!.id,
      content: msg,
    })

    if (error) {
      toast.error('Failed to send message')
    } else {
      setInput('')
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const cancelMission = async () => {
    if (!booking) return
    const confirmed = window.confirm('Cancel this mission?')
    if (!confirmed) return

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', ended_at: new Date().toISOString() })
      .eq('id', booking.id)

    if (error) {
      toast.error('Failed to cancel')
    } else {
      toast.success('Mission cancelled')
      router.push('/dashboard')
    }
  }

  const completeMission = async () => {
    if (!booking) return
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', booking.id)

    if (error) {
      toast.error('Failed to complete')
    } else {
      toast.success('Mission complete!', { duration: 5000 })
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-partner-dark flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-alabaster/30 border-t-alabaster rounded-full animate-spin" />
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="fixed inset-0 z-50 bg-partner-dark flex flex-col">
      {/* Header */}
      <header className="bg-partner-dark/80 backdrop-blur-xl border-b border-alabaster/10 px-5 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <span className="text-sm font-semibold text-alabaster capitalize">{booking.category}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-alabaster/80">{formatElapsed(elapsed)}</span>
          <button onClick={() => router.push('/dashboard')} className="p-1.5 rounded-lg hover:bg-alabaster/10 transition-colors">
            <X className="w-4 h-4 text-alabaster/60" />
          </button>
        </div>
      </header>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Customer card */}
        <div className="bg-alabaster/5 rounded-xl p-4 border border-alabaster/10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-copper/20 flex items-center justify-center">
                <User className="w-5 h-5 text-copper" />
              </div>
              <div>
                <p className="text-sm font-semibold text-alabaster">{customerName}</p>
                <p className="text-[10px] text-alabaster/50">Customer</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-alabaster/60">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{booking.exact_meeting_spot}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{new Date(booking.scheduled_at).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Chat toggle */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full flex items-center justify-between bg-alabaster/5 rounded-xl px-4 py-3 border border-alabaster/10"
        >
          <span className="text-sm font-medium text-alabaster">Chat</span>
          {showChat ? <ChevronDown className="w-4 h-4 text-alabaster/60" /> : <ChevronUp className="w-4 h-4 text-alabaster/60" />}
        </button>

        {/* Messages */}
        {showChat && (
          <div className="bg-alabaster/5 rounded-xl border border-alabaster/10">
            <div className="max-h-[35vh] overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-xs text-alabaster/40 text-center py-4">No messages yet. Say hello!</p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === booking.customer_id ? '' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-xl px-3.5 py-2 text-sm ${
                    m.sender_id === booking.customer_id
                      ? 'bg-alabaster/10 text-alabaster'
                      : 'bg-copper text-white'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={chatEnd} />
            </div>

            {/* Input */}
            <div className="border-t border-alabaster/10 p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-alabaster/10 rounded-xl py-2.5 px-4 text-sm text-alabaster placeholder-alabaster/30 focus:outline-none focus:ring-2 focus:ring-copper/30 transition-all min-h-[40px]"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="bg-copper p-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-30 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="shrink-0 border-t border-alabaster/10 px-5 py-4 flex gap-3">
        <button
          onClick={cancelMission}
          className="flex-1 bg-alabaster/10 text-alabaster py-3 rounded-xl text-sm font-medium hover:bg-alabaster/15 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={completeMission}
          className="flex-1 bg-green text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all"
        >
          Complete
        </button>
      </div>
    </div>
  )
}
