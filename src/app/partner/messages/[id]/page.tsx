'use client'

import { useParams } from 'next/navigation'
import { useAppStore } from '@/store/use-store'
import { useAuthStore } from '@/store/auth-store'
import { PartnerHeader } from '@/components/shared/partner-nav'
import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'

export default function PartnerMessageThread() {
  const params = useParams()
  const requestId = params.id as string
  const request = useAppStore((s) => s.getRequest(requestId))
  const messages = useAppStore((s) => s.getMessagesByRequest(requestId))
  const addMessage = useAppStore((s) => s.addMessage)
  const userName = useAuthStore((s) => s.userName)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [inputText, setInputText] = useState('')

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!request) {
    return (
      <div>
        <PartnerHeader title="Messages" />
        <div className="px-5 py-20 text-center">
          <p className="text-muted-foreground">Thread not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100dvh)]">
      <PartnerHeader title="Journey Messages" />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground/60">
            {request.category} Support · {format(new Date(request.date), 'MMM dd, yyyy')}
          </p>
        </div>

        {messages.map((msg) => {
          const isSystem = msg.from === 'system'
          const isPartner = msg.from === 'partner'
          const isCustomer = msg.from === 'customer'

          return (
            <div
              key={msg.id}
              className={`flex ${isPartner ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isSystem
                    ? 'bg-muted text-foreground'
                    : isCustomer
                      ? 'bg-blue/10 text-foreground'
                      : 'bg-primary text-primary-foreground'
                }`}
              >
                {!isPartner && (
                  <p className={`text-[10px] font-medium mb-1 ${
                    isSystem ? 'text-muted-foreground/60' : 'text-blue'
                  }`}>
                    {msg.senderName}
                  </p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${
                  isPartner ? 'text-primary-foreground/60' : 'text-muted-foreground/60'
                }`}>
                  {format(new Date(msg.timestamp), 'h:mm a')}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-card border-t border-border px-5 py-3 ios-safe-bottom">
        <div className="flex gap-2">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputText.trim()) {
                addMessage(requestId, {
                  id: `msg-${Date.now()}`,
                  requestId,
                  from: 'partner',
                  senderName: userName || 'You',
                  content: inputText.trim(),
                  timestamp: new Date().toISOString(),
                })
                setInputText('')
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-muted border-0 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
          />
          <button
            onClick={() => {
              if (!inputText.trim()) return
              addMessage(requestId, {
                id: `msg-${Date.now()}`,
                requestId,
                from: 'partner',
                senderName: userName || 'You',
                content: inputText.trim(),
                timestamp: new Date().toISOString(),
              })
              setInputText('')
            }}
            className="bg-blue text-white px-5 rounded-xl text-sm font-medium hover:opacity-90 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
