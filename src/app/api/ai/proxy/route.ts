import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `You are an AI assistant for WITHH, a human accompaniment platform. Analyze support requests and return JSON.`

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages, model: requestedModel, responseFormat } = await req.json()
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

    if (apiKey) {
      const model = requestedModel || process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'openrouter/mistralai/mistral-7b-instruct:free'

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'WITHH',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          ...(responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {}),
          max_tokens: 1024,
          temperature: 0.3,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        return NextResponse.json({ error: 'OpenRouter API error', details: errText }, { status: 500 })
      }

      const data = await res.json()
      return NextResponse.json(data)
    }

    // Fallback: try local Ollama
    const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434/api'
    try {
      const res = await fetch(`${ollamaUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          stream: false,
          options: { temperature: 0.3 },
        }),
      })
      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch {}

    return NextResponse.json({ error: 'No AI provider available. Set NEXT_PUBLIC_OPENROUTER_API_KEY or install Ollama.' }, { status: 503 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
