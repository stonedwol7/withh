import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import type { VerifyOtpParams } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const rawType = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (token_hash && rawType) {
    const supabase = createClient()
    const type = ['signup', 'email', 'recovery', 'invite', 'magiclink'].includes(rawType) ? rawType as VerifyOtpParams['type'] : 'email'
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }
  return NextResponse.redirect(`${origin}/login?error=verification_failed`)
}
