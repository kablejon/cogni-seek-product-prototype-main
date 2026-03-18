import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to home (with locale prefix if not default)
      const homeUrl = locale === 'en' ? `${origin}/` : `${origin}/${locale}`
      return NextResponse.redirect(homeUrl)
    }
  }

  // On error, redirect home with error flag
  const errorUrl = locale === 'en' ? `${origin}/?authError=1` : `${origin}/${locale}?authError=1`
  return NextResponse.redirect(errorUrl)
}
