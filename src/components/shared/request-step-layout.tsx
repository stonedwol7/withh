'use client'

import { useRouter } from 'next/navigation'
import { ProgressBar } from './progress-bar'
import { ArrowLeft } from 'lucide-react'

interface RequestStepLayoutProps {
  step: number
  total?: number
  title: string
  children: React.ReactNode
  onBack?: () => void
}

export function RequestStepLayout({ step, total = 7, title, children, onBack }: RequestStepLayoutProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto w-full">
      <header className="bg-card border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={handleBack}
            className="p-1 -ml-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-xs text-muted-foreground font-medium">Step {step} of {total}</span>
          </div>
          <div className="w-7" />
        </div>
        <ProgressBar current={step} total={total} />
      </header>

      <div className="flex-1 px-5 pt-6 pb-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">{title}</h1>
        {children}
      </div>
    </div>
  )
}
