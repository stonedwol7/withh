import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        for (const table of ['customers', 'support_partners', 'operations_team'] as const) {
          const { data } = await supabase.from(table).select('id').eq('auth_id', user.id).maybeSingle()
          if (data) {
            const route = table === 'customers' ? '/customer' : table === 'support_partners' ? '/partner' : '/ops'
            return NextResponse.redirect(`${origin}${route}`)
          }
        }
        return NextResponse.redirect(`${origin}/customer`)
      }
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
