import { NextResponse, type NextRequest } from 'next/server'
import { isRateLimited } from '@/lib/rate-limiter'
import { updateSession } from '@/lib/supabase-middleware'

export async function middleware(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1'
  const isLimited = isRateLimited(ip, {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  })

  if (isLimited) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
