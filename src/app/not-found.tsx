import Link from 'next/link'
import { BrandWordmark } from '@/components/brand/brand-wordmark'
import { BrandMark } from '@/components/brand/brand-mark'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5">
      <BrandMark size={48} className="text-muted-foreground/30 mb-6" />
      <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
      <p className="text-lg text-muted-foreground mb-2">Page not found</p>
      <p className="text-sm text-muted-foreground/60 mb-8 text-center max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>
    </div>
  )
}
