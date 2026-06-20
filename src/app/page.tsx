'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Shield, Heart, Star, ChevronDown, MapPin } from 'lucide-react'

const categories = [
  'Hospital Visits', 'Government Offices', 'Interviews',
  'Travel Assistance', 'Court Appearances', 'Admissions',
  'Documentation', 'Elderly Support', 'Appointments',
]

const faqs = [
  { q: 'What is WITHH?', a: 'WITHH connects you with vetted Support Partners who accompany you to important appointments. Never face a hospital visit, government office, or difficult meeting alone.' },
  { q: 'How does it work?', a: 'Tell us when and where. We match you with a verified partner. They meet you, accompany you, and ensure everything goes smoothly.' },
  { q: 'How much does it cost?', a: 'Standard support starts at ₹699 (2 hrs). Sensitive support starts at ₹899. Full price shown before confirmation.' },
  { q: 'How is safety ensured?', a: 'Every partner is verified and background-checked. You review them before confirming. Our team is reachable throughout.' },
]

export default function LandingPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="bg-alabaster min-h-screen">
      <header className="sticky top-0 z-50 bg-alabaster/80 backdrop-blur-xl border-b border-slate/5">
        <div className="max-w-5xl mx-auto px-5 h-14 md:h-16 flex items-center justify-between">
          <span className="text-sm font-bold text-slate tracking-tight">WITHH.ME</span>
          <span className="text-[10px] md:text-[11px] text-muted-foreground/50 tracking-wider hidden sm:inline">Trusted Human Support</span>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-5 pt-16 pb-14 md:pt-28 md:pb-20 text-center">
        <span className="inline-flex items-center gap-1.5 bg-copper/5 border border-copper/10 rounded-full px-3.5 py-1 mb-6 md:mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-copper/40" />
          <span className="text-[10px] md:text-[11px] text-copper/70 font-medium tracking-wide">Trusted Human Support</span>
        </span>
        <h1 className="text-[2.25rem] leading-[1.1] md:text-[4rem] font-bold text-slate tracking-tight mb-3 md:mb-4">
          Never Alone.
        </h1>
        <p className="text-sm md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed mb-8 md:mb-10">
          For life&apos;s important moments, when having someone by your side makes all the difference.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button onClick={() => router.push('/book')} className="w-full sm:w-auto bg-copper text-white px-6 py-3.5 rounded-xl text-sm md:text-base font-medium hover:opacity-90 transition-all shadow-sm inline-flex items-center justify-center gap-2 min-h-[48px]">
            Request Support <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => router.push('/login')} className="w-full sm:w-auto bg-card text-slate border border-slate/10 px-6 py-3.5 rounded-xl text-sm md:text-base font-medium hover:border-copper/20 transition-all shadow-sm inline-flex items-center justify-center gap-2 min-h-[48px]">
            Sign In
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 pb-16 md:pb-20">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-[10px] md:text-[11px] text-copper/60 font-medium tracking-widest uppercase">Situations</span>
          <h2 className="text-xl md:text-3xl font-bold text-slate mt-2.5 md:mt-3 mb-2 tracking-tight">When WITHH supports you</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
          {categories.map((label) => (
            <div key={label} className="bg-card rounded-xl md:rounded-2xl border border-slate/5 px-3.5 py-3 md:px-4 md:py-3.5 flex items-center gap-2.5 min-h-[52px] transition-all hover:border-copper/20">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-copper/[0.06] flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-copper/60" />
              </div>
              <span className="text-xs md:text-sm font-medium text-slate leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card border-t border-slate/5 py-16 md:py-20">
        <div className="max-w-2xl mx-auto space-y-2 md:space-y-2.5 px-5">
          <div className="text-center mb-10">
            <span className="text-[10px] md:text-[11px] text-copper/60 font-medium tracking-widest uppercase">FAQ</span>
            <h2 className="text-xl md:text-3xl font-bold text-slate mt-2.5 tracking-tight">Common questions</h2>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} className="bg-alabaster rounded-xl md:rounded-2xl border border-slate/5 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-4 md:px-5 py-3.5 md:py-4 flex items-center justify-between text-left gap-3 min-h-[48px]"
              >
                <span className="text-xs md:text-sm font-medium text-slate leading-snug">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate/20 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${openFaq === i ? 'max-h-60 pb-4 md:pb-5 px-4 md:px-5' : 'max-h-0'}`}>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate/5 py-10 md:py-12">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <p className="text-sm font-bold text-slate tracking-tight mb-4">WITHH.ME</p>
          <p className="text-[10px] md:text-[11px] text-muted-foreground/30 tracking-wide">Trusted Human Support &middot; Never Alone.</p>
        </div>
      </footer>
    </div>
  )
}
