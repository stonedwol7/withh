import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

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

  const cookieStore = await cookies()
  const pendingBookingRaw = cookieStore.get('withh_pending_booking')?.value

  if (pendingBookingRaw) {
    try {
      const draft = JSON.parse(decodeURIComponent(pendingBookingRaw))

      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          category: 'companionship',
          principal_name: draft.principalName || 'Myself',
          exact_meeting_spot: draft.location || '',
          scheduled_at: draft.scheduledAt,
          requires_female_partner: draft.preferredGender === 'female',
          duration_estimate_minutes: (draft.durationHours || 2) * 60,
          total_price: draft.totalPrice ?? 299 * (draft.durationHours || 2),
          notes: draft.userNeedDescription || null,
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
