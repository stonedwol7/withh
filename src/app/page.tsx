'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, Shield, UserCheck, Heart, Users, Check, ChevronDown, MapPin, Star, Phone, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { BrandMark } from '@/components/brand/brand-mark'
import { BrandWordmark } from '@/components/brand/brand-wordmark'

const situations = [
  { icon: MapPin, label: 'Hospital Visits' },
  { icon: MapPin, label: 'Government Offices' },
  { icon: MapPin, label: 'Interviews' },
  { icon: MapPin, label: 'Travel Assistance' },
  { icon: MapPin, label: 'Court Appearances' },
  { icon: MapPin, label: 'Admissions' },
  { icon: MapPin, label: 'Documentation' },
  { icon: MapPin, label: 'Elderly Support' },
  { icon: MapPin, label: 'Important Appointments' },
]

const howItWorks = [
  { num: 1, title: 'Tell us where you need support', desc: 'Share the date, time, location and what you need help with.' },
  { num: 2, title: 'We match you with a vetted Support Partner', desc: 'We find a verified partner who matches your needs and preferences.' },
  { num: 3, title: 'Move forward confidently', desc: 'Your partner meets you, accompanies you, and ensures everything goes smoothly.' },
]

const whyChoose = [
  { icon: Heart, title: 'Trusted Human Support', desc: 'Real people who are vetted, trained, and committed to your wellbeing.' },
  { icon: UserCheck, title: 'Verified Partners', desc: 'Every partner passes identity verification and background checks.' },
  { icon: Users, title: 'Human Presence', desc: 'Someone by your side for life\'s important moments.' },
  { icon: MessageSquare, title: 'Reliable Communication', desc: 'Clear updates and direct contact throughout your journey.' },
  { icon: Star, title: 'Careful Matching', desc: 'We consider your preferences, language, and needs in every match.' },
]

const trustItems = [
  { icon: UserCheck, title: 'Identity Verification', desc: 'Every partner is identity-verified before they can accept assignments.' },
  { icon: Shield, title: 'Partner Screening', desc: 'In-person interviews, reference checks, and ongoing performance reviews.' },
  { icon: Phone, title: 'Emergency Escalation', desc: 'Dedicated support team reachable throughout every journey.' },
  { icon: Heart, title: 'Support Team', desc: 'Real humans who care — available by phone, chat, or email.' },
  { icon: Users, title: 'Transparent Process', desc: 'You know who your partner is before you confirm. No surprises.' },
]

const partnerPoints = [
  { title: 'Who partners are', desc: 'Support Partners are vetted individuals from diverse backgrounds — healthcare, social work, community service, and more.' },
  { title: 'Who should apply', desc: 'Anyone who is empathetic, reliable, and wants to make a meaningful difference in their community.' },
  { title: 'What the role involves', desc: 'Accompanying clients to appointments, providing reassurance, assisting with navigation and communication.' },
  { title: 'How earnings work', desc: 'Set your own schedule. Earn per journey. Transparent payouts within 5 business days.' },
  { title: 'What makes a great Support Partner', desc: 'Patience, empathy, reliability, good communication, and a genuine desire to help others.' },
]

const faqs = [
  { q: 'What is WITHH?', a: 'WITHH is a trusted human support service. We provide vetted Support Partners who accompany people to important appointments, helping them feel confident and never alone.' },
  { q: 'Who are Support Partners?', a: 'Support Partners are carefully vetted individuals who have passed identity verification, background checks, and in-person interviews. They come from diverse backgrounds and are committed to providing reliable human support.' },
  { q: 'How much does it cost?', a: 'Pricing depends on the type and duration of support needed. Standard support starts at ₹699 for up to 2 hours. Sensitive support (hospital, interview) starts at ₹899. You\'ll see the full price before confirming.' },
  { q: 'Can I request for family?', a: 'Yes. You can request support for yourself or someone you care about — a family member, friend, or loved one who needs accompaniment.' },
  { q: 'How does safety work?', a: 'Every partner is verified and background-checked. You can review your match before confirming. Our support team is available throughout every journey. An SOS button provides immediate assistance if needed.' },
  { q: 'How are partners selected?', a: 'We match you based on your preferences — gender, language, location, and type of support needed. Our careful matching process ensures you get the right person for your specific situation.' },
]

export default function LandingPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border z-50">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <BrandMark size={16} className="text-accent" />
            <BrandWordmark size="sm" />
          </span>
          <span className="text-[10px] text-muted-foreground/50 tracking-wider hidden sm:inline">Trusted Human Support</span>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/login')} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Sign In</button>
            <button onClick={() => router.push('/register')} className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-all">Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "url('/brand-pattern.png')", backgroundSize: '400px' }} />
        <div className="max-w-4xl mx-auto px-5 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-3">WITHH</h1>
            <p className="text-lg md:text-xl text-accent font-medium mb-2 tracking-wide">Trusted Human Support</p>
            <p className="text-2xl md:text-3xl text-foreground font-semibold mb-6">Never Alone.</p>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              For life&apos;s important moments, when having someone by your side makes all the difference.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => router.push('/customer/request')} className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-black/10 flex items-center gap-2 w-full sm:w-auto justify-center">
                Request Support <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => router.push('/register?role=partner')} className="bg-card border border-border text-foreground px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-muted transition-all w-full sm:w-auto justify-center">
                Become a Support Partner
              </button>
            </div>
            <button onClick={() => document.getElementById('situations')?.scrollIntoView({ behavior: 'smooth' })} className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Everyday Situations */}
      <section id="situations" className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2 tracking-tight">EVERYDAY SITUATIONS</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">Common situations where WITHH Support Partners accompany you.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {situations.map((item) => (
              <div key={item.label} className="bg-card rounded-2xl border border-border p-5 card-hover flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How WITHH Works */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2 tracking-tight">HOW WITHH WORKS</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">Simple steps to get the support you need.</p>
          <div className="grid md:grid-cols-3 gap-6">
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

      {/* Why People Choose WITHH */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2 tracking-tight">WHY PEOPLE CHOOSE WITHH</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">What makes WITHH different.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {whyChoose.map((item) => (
              <div key={item.title} className="bg-card rounded-2xl border border-border p-6 card-hover">
                <item.icon className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2 tracking-tight">TRUST &amp; SAFETY</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">Your safety is our foundation. Every measure is in place for your peace of mind.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Become a Support Partner */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2 tracking-tight">BECOME A SUPPORT PARTNER</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">Make a meaningful difference in your community.</p>
          <div className="max-w-3xl mx-auto space-y-4">
            {partnerPoints.map((point) => (
              <div key={point.title} className="bg-card rounded-2xl border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">{point.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => router.push('/register?role=partner')} className="bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-medium hover:opacity-90 transition-all inline-flex items-center gap-2">
              Apply Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2 tracking-tight">FAQ</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">Answers to common questions.</p>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-5 py-4 flex items-center justify-between text-left">
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
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
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <p className="text-3xl md:text-4xl font-bold text-foreground mb-6">Never Alone.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => router.push('/customer/request')} className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-black/10 inline-flex items-center gap-2">
              Request Support <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => router.push('/register?role=partner')} className="bg-card border border-border text-foreground px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-muted transition-all">
              Become a Support Partner
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <BrandMark size={14} className="text-muted-foreground" />
              <span className="text-sm font-bold tracking-tight text-foreground">WITHH</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => router.push('/privacy')} className="hover:text-foreground transition-colors">Privacy</button>
              <button onClick={() => router.push('/terms')} className="hover:text-foreground transition-colors">Terms</button>
              <button onClick={() => router.push('/contact')} className="hover:text-foreground transition-colors">Contact</button>
              <button onClick={() => router.push('/help')} className="hover:text-foreground transition-colors">Help</button>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground/50">WITHH &middot; Trusted Human Support &middot; Never Alone.</p>
        </div>
      </footer>
    </div>
  )
}
