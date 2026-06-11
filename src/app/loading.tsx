import { BrandMark } from '@/components/brand/brand-mark'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-pulse">
        <BrandMark size={20} className="text-accent mx-auto mb-3 opacity-30" />
        <p className="text-xs text-muted-foreground/40">Loading...</p>
      </div>
    </div>
  )
}
