import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes — never require auth. Booking flow is fully anonymous
  // until the "Secure Booking" button triggers sign-in.
  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/book', '/book/requested', '/help', '/contact', '/privacy', '/terms']
  if (publicPaths.includes(path)) {
    return response
  }

  const isOpsRoute = path.startsWith('/ops')
  const isPartnerRoute = path.startsWith('/partner')
  const isPartnerKyc = path === '/partner/kyc'
  const isCustomerDashboard = path.startsWith('/dashboard')
  const isAppRoute = path.startsWith('/journey') || path.startsWith('/messages') || path.startsWith('/profile')

  if ((isPartnerRoute || isCustomerDashboard || isAppRoute || isOpsRoute) && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // KYC page is exempt from partner role check — allows onboarding
  if (isPartnerRoute && user && !isPartnerKyc) {
    const { data: partners } = await supabase
      .from('support_partners')
      .select('id')
      .eq('auth_id', user.id)
      .limit(1)

    const isPartner = partners && partners.length > 0
    if (!isPartner) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
