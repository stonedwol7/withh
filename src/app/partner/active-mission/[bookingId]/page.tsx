'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock, MapPin, User, Send, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ActiveMissionPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const router = useRouter()
  const getSupabase = useCallback(() => createClient(), [])
  const [request, setRequest] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [showChat, setShowChat] = useState(true)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const chatEnd = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const bookingId = (await params).bookingId

      const { data: auth } = await getSupabase().auth.getUser()
      if (!auth.user) { router.replace('/login'); return }

      const { data: reqs } = await (getSupabase() as any)
        .from('requests')
        .select('*')
        .eq('id', bookingId)
        .limit(1)

      const r = (reqs || [])[0]
      if (!r) {
        toast.error('Mission not found')
        router.replace('/partner')
        return
      }

      if (cancelled) return
      setRequest(r)

      const { data: customers } = await (getSupabase() as any)
        .from('customers')
        .select('name')
        .eq('auth_id', r.customer_id)
        .limit(1)

      const customer = ((customers || [])[0] as any)
      setCustomerName(customer?.name || 'Customer')

      const { data: msgs } = await (getSupabase() as any)
        .from('journey_messages')
        .select('*')
        .eq('request_id', bookingId)
        .order('created_at', { ascending: true })

      if (msgs) setMessages(msgs as any[])

      setLoading(false)

      const channel = (getSupabase() as any)
        .channel(`mission-${bookingId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'journey_messages',
          filter: `request_id=eq.${bookingId}`,
        }, (payload: any) => {
          setMessages((prev: any[]) => [...prev, payload.new])
        })
        .subscribe()

      channelRef.current = channel
    }

    init()

    return () => {
      cancelled = true
      if (channelRef.current) {
        getSupabase().removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [router, params, getSupabase])

  const scrollToBottom = useCallback(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    if (!request?.started_at) return
    const start = new Date(request.started_at).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [request?.started_at])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (request?.status === 'in-progress') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [request?.status])

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h > 0 ? `${h}h ` : ''}${m}m ${sec}s`
  }

  const sendMessage = async () => {
    const msg = input.trim()
    if (!msg || !request) return
    setSending(true)

    const { data: auth } = await getSupabase().auth.getUser()
    const { error } = await (getSupabase() as any)
      .from('journey_messages')
      .insert({
        request_id: request.id,
        sender_id: auth.user?.id,
        sender_type: 'partner',
        sender_name: 'Partner',
        content: msg,
        created_at: new Date().toISOString(),
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
    if (!request) return
    const confirmed = window.confirm('Cancel this mission?')
    if (!confirmed) return

    const { error } = await (getSupabase() as any)
      .from('requests')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', request.id)

    if (error) {
      toast.error('Failed to cancel')
    } else {
      toast.success('Mission cancelled')
      router.push('/partner')
    }
  }

  const completeMission = async () => {
    if (!request) return
    const { error } = await (getSupabase() as any)
      .from('requests')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', request.id)

    if (error) {
      toast.error('Failed to complete')
    } else {
      toast.success('Mission complete!', { duration: 5000 })
      router.push('/partner')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0D1B3D] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!request) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#0D1B3D] flex flex-col">
      {/* Header */}
      <header className="bg-[#0D1B3D]/80 backdrop-blur-xl border-b border-white/10 px-5 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <span className="text-sm font-semibold text-white capitalize">{request.category || 'Mission'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-white/80">{formatElapsed(elapsed)}</span>
          <button onClick={() => router.push('/partner')} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </header>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Customer card */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4F6BFF]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#4F6BFF]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{customerName}</p>
                <p className="text-[10px] text-white/50">Customer</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{request.meeting_location || request.destination || 'No location set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{request.date || ''}{request.time ? ` at ${request.time}` : ''}</span>
            </div>
          </div>
        </div>

        {/* Chat toggle */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/10"
        >
          <span className="text-sm font-medium text-white">Chat</span>
          {showChat ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronUp className="w-4 h-4 text-white/60" />}
        </button>

        {/* Messages */}
        {showChat && (
          <div className="bg-white/5 rounded-xl border border-white/10">
            <div className="max-h-[35vh] overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-xs text-white/40 text-center py-4">No messages yet. Say hello!</p>
              )}
              {messages.map((m: any) => (
                <div key={m.id} className={`flex ${m.sender_type === 'customer' ? '' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-xl px-3.5 py-2 text-sm ${
                    m.sender_type === 'customer'
                      ? 'bg-white/10 text-white'
                      : 'bg-[#4F6BFF] text-white'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={chatEnd} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 rounded-xl py-2.5 px-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#4F6BFF]/30 transition-all min-h-[40px]"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="bg-[#4F6BFF] p-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-30 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="shrink-0 border-t border-white/10 px-5 py-4 flex gap-3">
        <button
          onClick={cancelMission}
          className="flex-1 bg-white/10 text-white py-3 rounded-xl text-sm font-medium hover:bg-white/15 transition-all"
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
