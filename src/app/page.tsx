'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Shield, UserCheck, Heart, Users, Check, ChevronDown, MapPin, Clock, Star, Phone, Mail, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { BrandMark } from '@/components/brand/brand-mark'
import { BrandWordmark } from '@/components/brand/brand-wordmark'

const situations = [
  { icon: MapPin, label: 'Hospital Visits', desc: 'Medical appointments, discharge, checkups' },
  { icon: MapPin, label: 'Government Offices', desc: 'Passport, Aadhaar, property, licenses' },
  { icon: MapPin, label: 'Interviews', desc: 'Job interviews, college admissions' },
  { icon: MapPin, label: 'Travel Assistance', desc: 'Airport, railway station, bus stand' },
  { icon: MapPin, label: 'Admissions', desc: 'College, hostel, course enrollment' },
  { icon: MapPin, label: 'Court Appearances', desc: 'Legal proceedings, documentation' },
  { icon: MapPin, label: 'Elderly Support', desc: 'Senior citizen accompaniment' },
  { icon: MapPin, label: 'Important Appointments', desc: 'Bank, visa, consulate, notary' },
]

const trustItems = [
  { icon: UserCheck, title: 'Verification', desc: 'Every partner is identity-verified and background-checked.' },
  { icon: Shield, title: 'Screening', desc: 'In-person interviews, reference checks, and ongoing reviews.' },
  { icon: Heart, title: 'Escalation', desc: 'Dedicated support team available throughout every journey.' },
  { icon: Users, title: 'Customer Support', desc: 'Reach us by phone, chat, or email — we respond within minutes.' },
]

const howItWorks = [
  { num: 1, title: 'Tell us where you need support', desc: 'Share the date, time, location and what you need help with.' },
  { num: 2, title: 'We match you carefully', desc: 'We find a verified support partner who matches your needs and preferences.' },
  { num: 3, title: 'Go together confidently', desc: 'Your partner meets you, accompanies you, and ensures everything goes smoothly.' },
  { num: 4, title: 'Share your experience', desc: 'Rate your journey and help us improve. Refer friends and earn rewards.' },
]

const partnerBenefits = [
  'Set your own schedule',
  'Earn ₹500–₹2,000 per journey',
  'Choose assignments that match your skills',
  'Be part of a trusted human community',
  'Get verified and start within 48 hours',
]

const faqs = [
  { q: 'How does WITHH work?', a: 'You tell us where and when you need support. We match you with a verified support partner who meets you there and accompanies you through your appointment or task.' },
  { q: 'Who are support partners?', a: 'Support partners are verified individuals who have completed background checks and in-person interviews. They come from diverse backgrounds including healthcare, social work, and community service.' },
  { q: 'Is my information safe?', a: 'Yes. All personal information is encrypted and never shared without your consent. Partners only receive what they need for the specific journey.' },
  { q: 'Can I choose my support partner?', a: 'Yes. We recommend the best match based on your needs, preferences, and language, but you always have the final say.' },
  { q: 'What if I need to cancel?', a: 'You can cancel anytime through the app. Cancellations made 24+ hours before are fully refundable.' },
  { q: 'Is WITHH available in my area?', a: 'We are currently available in Bangalore and expanding to other cities. Check the app for availability in your location.' },
]

export default function LandingPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-50">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <BrandSignature />
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              Sign In
            </button>
            <button onClick={() => router.push('/register')} className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: "url('/brand-pattern.png')", backgroundSize: '400px' }} />
        <div className="max-w-5xl mx-auto px-5 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <BrandMark size={40} className="text-accent mx-auto mb-6 opacity-60" />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-4">
              When you can&apos;t go alone,<br />
              <span className="text-accent">we&apos;ll go with you.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Trusted human accompaniment for life&apos;s important moments. Hospital visits, government offices, interviews — nobody should face them alone.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => router.push('/customer/request')} className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-black/10 flex items-center gap-2 w-full sm:w-auto justify-center">
                Request Support
                <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => router.push('/register?role=partner')} className="bg-card border border-border text-foreground px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-muted transition-all flex items-center gap-2 w-full sm:w-auto justify-center">
                Become a Support Partner
              </button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-green" />
                <span>Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber" />
                <span>4.9 avg rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-accent" />
                <span>500+ journeys</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">How It Works</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">Three simple steps to get the support you need.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((step) => (
              <div key={step.num} className="bg-card rounded-2xl border border-border p-6 text-center card-hover">
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center text-lg font-bold mx-auto mb-4">{step.num}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Situations */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">We&apos;re Here For</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">Common situations where our support partners accompany you.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {situations.map((item) => (
              <div key={item.label} className="bg-card rounded-2xl border border-border p-5 card-hover">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">Trust & Safety</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">Your safety is our highest priority. Every measure is taken to ensure peace of mind.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((item) => (
              <div key={item.title} className="bg-card rounded-2xl border border-border p-6 card-hover">
                <item.icon className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Partners */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Become a Support Partner</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">Make a meaningful difference in your community while earning on your own schedule. Support partners are the heart of WITHH.</p>
              <div className="space-y-3 mb-8">
                {partnerBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push('/register?role=partner')} className="bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-medium hover:opacity-90 transition-all inline-flex items-center gap-2">
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-card rounded-3xl border border-border p-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">What partners say</h3>
              <div className="space-y-6">
                <div className="border-l-2 border-accent pl-4">
                  <p className="text-sm text-foreground italic leading-relaxed">&ldquo;Being a support partner has given me purpose. Every journey is a chance to make someone feel safe and seen.&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-2">— Priya, Support Partner</p>
                </div>
                <div className="border-l-2 border-accent pl-4">
                  <p className="text-sm text-foreground italic leading-relaxed">&ldquo;I accompany elderly patients to their hospital visits. The gratitude in their eyes is everything.&rdquo;</p>
                  <p className="text-xs text-muted-foreground mt-2">— Arun, Support Partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">Everything you need to know about WITHH.</p>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-5 py-4 flex items-center justify-between text-left">
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <BrandMark size={48} className="text-accent mx-auto mb-6 opacity-50" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to go together?</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10">Request a support partner today. No login required to explore.</p>
          <button onClick={() => router.push('/customer/request')} className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-black/10 inline-flex items-center gap-2">
            Request Support
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BrandMark size={16} className="text-muted-foreground" />
              <BrandWordmark size="sm" />
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => router.push('/privacy')} className="hover:text-foreground transition-colors">Privacy</button>
              <button onClick={() => router.push('/terms')} className="hover:text-foreground transition-colors">Terms</button>
              <button onClick={() => router.push('/contact')} className="hover:text-foreground transition-colors">Contact</button>
              <button onClick={() => router.push('/help')} className="hover:text-foreground transition-colors">Help</button>
            </div>
            <p className="text-xs text-muted-foreground/60">&copy; 2026 WITHH. Human Accompaniment Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function BrandSignature() {
  return (
    <span className="inline-flex items-center gap-2">
      <BrandMark size={18} className="text-accent" />
      <BrandWordmark size="sm" />
    </span>
  )
}
