import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Log all incoming params for debugging
  console.log('[auth/callback] params:', {
    code: code ? `${code.substring(0, 20)}...` : null,
    error,
    errorDescription,
    allParams: Object.fromEntries(searchParams.entries()),
  })

  if (error) {
    console.error('[auth/callback] OAuth error from provider:', error, errorDescription)
    return NextResponse.redirect(`${origin}/?authError=1`)
  }

  if (code) {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[auth/callback] exchangeCodeForSession result:', {
      user: data?.user?.email ?? null,
      error: exchangeError?.message ?? null,
      errorCode: exchangeError?.code ?? null,
    })

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}/`)
    }

    console.error('[auth/callback] Exchange failed:', exchangeError)
  } else {
    console.error('[auth/callback] No code in callback URL')
  }

  return NextResponse.redirect(`${origin}/?authError=1`)
}
