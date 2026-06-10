'use client'

import { Mail, Phone, MapPin, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { BrandMark } from '@/components/brand/brand-mark'
import { BrandWordmark } from '@/components/brand/brand-wordmark'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center gap-2">
          <BrandMark size={16} className="text-accent" />
          <BrandWordmark size="sm" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-10">We&apos;re here to help. Reach out anytime.</p>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Live Chat</h2>
              <p className="text-sm text-muted-foreground mb-3">Chat with our support team in real-time.</p>
              <button className="text-accent text-sm font-medium hover:underline inline-flex items-center gap-1">
                Start Chat <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green/10 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-green" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Email</h2>
              <p className="text-sm text-muted-foreground mb-1">We respond within 2 hours during business hours.</p>
              <a href="mailto:support@withh.com" className="text-accent text-sm font-medium hover:underline">support@withh.com</a>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber/10 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-amber" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Phone</h2>
              <p className="text-sm text-muted-foreground mb-1">Available 8 AM - 10 PM, 7 days a week.</p>
              <a href="tel:+919999999999" className="text-accent text-sm font-medium hover:underline">+91 99999 99999</a>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple/10 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-purple" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Office</h2>
              <p className="text-sm text-muted-foreground">Bangalore, India</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Back to home</Link>
        </div>
      </div>
    </div>
  )
}
