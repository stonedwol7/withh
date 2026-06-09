'use client'

import { useState } from 'react'
import { CustomerHeader } from '@/components/shared/customer-nav'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/use-store'
import { format } from 'date-fns'
import { MessageSquare, Plus, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

const statusIcons: Record<string, any> = {
  open: Clock,
  in_progress: AlertTriangle,
  resolved: CheckCircle,
}

const statusColors: Record<string, string> = {
  open: 'text-amber bg-amber/10',
  in_progress: 'text-blue bg-blue/10',
  resolved: 'text-green bg-green/10',
}

export default function TicketsPage() {
  const userName = useAuthStore((s) => s.userName)
  const tickets = useAppStore((s) => s.supportTickets)
  const ticketMessages = useAppStore((s) => s.ticketMessages)
  const addTicket = useAppStore((s) => s.addTicket)
  const addTicketMessage = useAppStore((s) => s.addTicketMessage)
  const [showNew, setShowNew] = useState(false)
  const [activeTicket, setActiveTicket] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [issueType, setIssueType] = useState('general')
  const [message, setMessage] = useState('')
  const [replyText, setReplyText] = useState('')

  const openTickets = tickets.filter((t) => t.status !== 'resolved')
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved')

  const handleCreate = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    const ticket = {
      id: `TKT-${Date.now().toString(36).toUpperCase()}`,
      userId: userName,
      subject: subject.trim(),
      issueType,
      status: 'open' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addTicket(ticket)
    addTicketMessage({
      id: `MSG-${Date.now()}`,
      ticketId: ticket.id,
      sender: userName,
      content: message.trim(),
      timestamp: new Date().toISOString(),
    })
    setShowNew(false)
    setSubject('')
    setIssueType('general')
    setMessage('')
    setActiveTicket(ticket.id)
    toast.success('Ticket created')
  }

  const handleReply = () => {
    if (!replyText.trim() || !activeTicket) return
    addTicketMessage({
      id: `MSG-${Date.now()}`,
      ticketId: activeTicket,
      sender: userName,
      content: replyText.trim(),
      timestamp: new Date().toISOString(),
    })
    setReplyText('')
  }

  const activeMsgs = ticketMessages.filter((m) => m.ticketId === activeTicket)
  const activeTicketData = tickets.find((t) => t.id === activeTicket)

  return (
    <div>
      <CustomerHeader title="Support Tickets" />
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">{openTickets.length} open ticket{openTickets.length !== 1 ? 's' : ''}</p>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>

        {showNew && (
          <div className="bg-card rounded-2xl border border-border p-5 mb-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Issue Type</label>
              <select value={issueType} onChange={(e) => setIssueType(e.target.value)} className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm">
                <option value="general">General Inquiry</option>
                <option value="payment">Payment</option>
                <option value="partner">Partner Issue</option>
                <option value="technical">Technical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary"
                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue..."
                rows={4}
                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm">Cancel</button>
              <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-medium">Submit</button>
            </div>
          </div>
        )}

        {activeTicket ? (
          <div>
            <button onClick={() => setActiveTicket(null)} className="text-xs text-accent mb-4 flex items-center gap-1">
              ← Back to tickets
            </button>
            <div className="bg-card rounded-2xl border border-border p-5 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-foreground">{activeTicketData?.subject}</h3>
                {activeTicketData && (
                  <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors[activeTicketData.status] || ''}`}>
                    {activeTicketData.status === 'resolved' ? <CheckCircle className="w-3 h-3" /> : activeTicketData.status === 'in_progress' ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {activeTicketData.status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
              {activeMsgs.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === userName ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.sender === userName ? 'bg-accent text-white rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                    <p className="text-xs font-medium opacity-70 mb-1">{msg.sender === userName ? 'You' : 'Support'}</p>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-60 text-right">{format(new Date(msg.timestamp), 'h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>

            {activeTicketData?.status !== 'resolved' && (
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message..."
                  rows={2}
                  className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
                <button onClick={handleReply} className="p-3 rounded-xl bg-accent text-white self-end hover:bg-accent/90 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {openTickets.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Open</p>
                <div className="space-y-2">
                  {openTickets.map((t) => (
                    <button key={t.id} onClick={() => setActiveTicket(t.id)}
                      className="w-full bg-card rounded-xl border border-border p-4 text-left hover:border-accent/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">{t.subject}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[t.status] || ''}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{format(new Date(t.createdAt), 'MMM dd, h:mm a')}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {resolvedTickets.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resolved</p>
                <div className="space-y-2">
                  {resolvedTickets.map((t) => (
                    <button key={t.id} onClick={() => setActiveTicket(t.id)}
                      className="w-full bg-card rounded-xl border border-border p-4 text-left hover:border-accent/30 transition-all opacity-70"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">{t.subject}</span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-green bg-green/10">
                          <CheckCircle className="w-3 h-3" /> Resolved
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{format(new Date(t.createdAt), 'MMM dd, h:mm a')}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tickets.length === 0 && !showNew && (
              <div className="text-center py-16">
                <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No support tickets yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Create one to get help</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
