import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const publicPaths = ['/login', '/auth', '/_not-found', '/']
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith('/api/') || pathname.startsWith('/_next/'))

  if (isPublic) {
    return NextResponse.next({ request })
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
