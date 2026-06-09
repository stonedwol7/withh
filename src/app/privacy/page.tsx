'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-accent mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-foreground mb-6">Privacy Policy</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>Last updated: June 2026</p>
        <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
        <p>We collect personal information including name, phone number, email address, location data, and journey details. We also collect device information and usage data.</p>
        <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Data</h2>
        <p>Your data is used to provide accompaniment services, match you with Support Partners, process payments, ensure safety, and improve our platform. We do not sell your personal data.</p>
        <h2 className="text-lg font-semibold text-foreground">3. Data Sharing</h2>
        <p>We share necessary information with Support Partners to facilitate journeys. Real-time location data is shared during active journeys with your consent. We may share data with law enforcement if required by law.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Data Retention</h2>
        <p>We retain your data for as long as your account is active and for a reasonable period thereafter for legal and operational purposes.</p>
        <h2 className="text-lg font-semibold text-foreground">5. Your Rights</h2>
        <p>Under India&apos;s Digital Personal Data Protection Act, you have the right to access, correct, and delete your personal data. You may withdraw consent at any time.</p>
        <h2 className="text-lg font-semibold text-foreground">6. Security</h2>
        <p>We implement reasonable security measures to protect your data, including encryption in transit and at rest.</p>
        <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
        <p>For privacy concerns, contact dpo@withh.in</p>
      </div>
    </div>
  )
}
