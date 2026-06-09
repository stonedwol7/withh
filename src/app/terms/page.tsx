'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-accent mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-foreground mb-6">Terms of Service</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>Last updated: June 2026</p>
        <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p>By accessing or using WITHH (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
        <h2 className="text-lg font-semibold text-foreground">2. Services</h2>
        <p>WITHH connects individuals (&ldquo;Customers&rdquo;) requiring accompaniment with verified Support Partners. We facilitate the matching process but are not responsible for the conduct of either party during a journey.</p>
        <h2 className="text-lg font-semibold text-foreground">3. User Obligations</h2>
        <p>Users must provide accurate information, treat all parties with respect, and comply with applicable laws. Customers must ensure they are physically and mentally capable of undertaking the journey.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Payments & Refunds</h2>
        <p>Payments are processed through the Platform. Refunds are subject to our refund policy and may take 5-7 business days to process.</p>
        <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
        <p>WITHH is a platform connecting users. We are not liable for any direct or indirect damages arising from the use of our services, including but not limited to personal injury, property damage, or emotional distress.</p>
        <h2 className="text-lg font-semibold text-foreground">6. Termination</h2>
        <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in harmful behavior.</p>
        <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
        <p>For questions about these terms, contact us at support@withh.in</p>
      </div>
    </div>
  )
}
