import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const publicPaths = [
  '/', '/login', '/register', '/contact', '/help', '/privacy', '/terms', '/_not-found',
]

function isPublic(pathname: string): boolean {
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true
  if (pathname.startsWith('/auth/')) return true
  if (pathname.startsWith('/api/')) return true
  if (pathname.startsWith('/_next/')) return true
  if (/\.(svg|png|jpg|jpeg|gif|webp|css|js|ico)$/.test(pathname)) return true
  return false
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  const response = NextResponse.next()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
