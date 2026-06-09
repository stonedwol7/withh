'use client'

import { useEffect } from 'react'
import { configureAi } from '@/lib/ai-engine'

export function AiInit() {
  useEffect(() => {
    const provider = (process.env.NEXT_PUBLIC_AI_PROVIDER || 'mock') as string
    if (provider === 'openrouter') {
      configureAi({ provider: 'openrouter' })
    } else if (provider === 'openai' && process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      configureAi({ provider: 'openai', apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY })
    } else if (provider === 'anthropic' && process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      configureAi({ provider: 'anthropic', apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY })
    } else {
      configureAi({ provider: 'mock' })
    }
  }, [])

  return null
}
