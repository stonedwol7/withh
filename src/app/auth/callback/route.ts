import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/journey'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`)
  }

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('customers')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (!existing) {
    await admin.from('customers').insert({
      auth_id: user.id,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
      email: user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any)
  }

  const cookieStore = await cookies()
  const pendingBookingRaw = cookieStore.get('withh_pending_booking')?.value

  if (pendingBookingRaw) {
    try {
      const draft = JSON.parse(decodeURIComponent(pendingBookingRaw))
      if (draft.trustedContact) {
        await admin.from('customers').update({
          emergency_contact: { name: draft.trustedContact },
          updated_at: new Date().toISOString(),
        } as any).eq('auth_id', user.id)
      }
    } catch {
      /* non-critical */
    }
  }

  if (pendingBookingRaw) {
    try {
      const draft = JSON.parse(decodeURIComponent(pendingBookingRaw))

      let date = null as string | null
      let time = null as string | null
      if (draft.scheduledAt) {
        const parts = draft.scheduledAt.split('T')
        date = parts[0]
        time = parts[1]?.slice(0, 5)
      }

      const { error: insertError } = await admin
        .from('requests')
        .insert({
          customer_id: user.id,
          category: 'companionship',
          description: draft.userNeedDescription || null,
          meeting_location: draft.location || '',
          date,
          time,
          duration: draft.durationHours ? `${draft.durationHours} hours` : null,
          preferred_gender: draft.preferredGender === 'female' ? 'female' : draft.preferredGender === 'male' ? 'male' : 'no-preference',
          status: 'requested',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)

      if (insertError) {
        return NextResponse.redirect(`${origin}/dashboard?error=booking_save_failed`)
      }
    } catch {
      return NextResponse.redirect(`${origin}/dashboard?error=booking_parse_failed`)
    } finally {
      cookieStore.delete('withh_pending_booking')
    }
  }

  return NextResponse.redirect(`${origin}${redirectTo}`)
}
