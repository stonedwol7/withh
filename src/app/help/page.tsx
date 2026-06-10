'use client'

import { useState } from 'react'
import { Search, ChevronDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { BrandMark } from '@/components/brand/brand-mark'
import { BrandWordmark } from '@/components/brand/brand-wordmark'

const helpTopics = [
  {
    q: 'How do I request a support partner?',
    a: 'Click "Request Support" on the homepage, fill in the details about your need (date, time, location), review and submit. You\'ll need to create an account before submitting.',
  },
  {
    q: 'How are support partners matched?',
    a: 'Our system matches you based on your preferences including gender, language, location, and the type of support needed. You can review the match and approve before the journey.',
  },
  {
    q: 'Can I cancel or reschedule?',
    a: 'Yes, you can cancel or reschedule from your request details page. Cancellations made 24+ hours before the start time are fully refundable.',
  },
  {
    q: 'What if I need help during a journey?',
    a: 'You can use the SOS button in the app during an active journey. Our support team is also available by phone and chat for immediate assistance.',
  },
  {
    q: 'How does payment work?',
    a: 'Payment is processed after the journey is completed. You can pay by card, UPI, or net banking. All transactions are encrypted and secure.',
  },
  {
    q: 'How do I become a support partner?',
    a: 'Click "Become a Support Partner" on the homepage, fill out the application, complete verification and background check. Most applicants are approved within 48 hours.',
  },
  {
    q: 'What documents do I need to become a partner?',
    a: 'You\'ll need a valid government ID (Aadhaar, PAN, Voter ID or Passport), a recent photograph, and proof of address.',
  },
  {
    q: 'How and when do partners get paid?',
    a: 'Partners receive payment within 5 business days after completing a journey. Payments are made via bank transfer or UPI.',
  },
]

export default function HelpPage() {
  const [openTopic, setOpenTopic] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const filtered = helpTopics.filter((t) =>
    t.q.toLowerCase().includes(search.toLowerCase()) ||
    t.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center gap-2">
          <BrandMark size={16} className="text-accent" />
          <BrandWordmark size="sm" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Help Center</h1>
        <p className="text-muted-foreground mb-6">Find answers to common questions.</p>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help topics..."
            className="w-full bg-card border border-input rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((topic, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setOpenTopic(openTopic === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-foreground">{topic.q}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openTopic === i ? 'rotate-180' : ''}`} />
              </button>
              {openTopic === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{topic.a}</p>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No results found. Try a different search term.</p>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center space-y-2">
          <p className="text-sm text-muted-foreground">Still need help?</p>
          <Link href="/contact" className="text-accent text-sm font-medium hover:underline inline-flex items-center gap-1">
            Contact us <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
