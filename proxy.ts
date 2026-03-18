import { createServerClient } from '@supabase/ssr'
import createIntlMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware first to get locale-aware response
  let response = intlMiddleware(request)

  // 2. Refresh Supabase session on every request (required by @supabase/ssr)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = intlMiddleware(request)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 3. Protect /detect/* routes — redirect unauthenticated users to home
  const pathname = request.nextUrl.pathname
  const isDetectRoute = /\/(en|zh-CN|zh-TW)?\/detect\//.test(pathname) ||
    pathname.startsWith('/detect/')

  if (isDetectRoute && !user) {
    const url = request.nextUrl.clone()
    const localeMatch = pathname.match(/^\/(en|zh-CN|zh-TW)/)
    url.pathname = localeMatch ? `/${localeMatch[1]}` : '/'
    url.searchParams.set('authRequired', '1')
    return NextResponse.redirect(url)
  }

  return response
}

export default middleware

export const config = {
  matcher: [
    '/',
    '/(en|zh-CN|zh-TW)/:path*',
    // Exclude Next.js internals, static files, API routes, and auth callback
    '/((?!_next|_vercel|api|auth/callback|.*\\..*).*)',
  ],
}
