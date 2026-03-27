import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const reportId = request.nextUrl.searchParams.get('reportId')

    if (!reportId) {
      return NextResponse.json({ success: false, error: 'reportId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: report, error: reportError } = await supabase
      .from('analysis_reports')
      .select('id, user_id, premium_result, session_data')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 })
    }

    const sessionData = (report.session_data && typeof report.session_data === 'object')
      ? (report.session_data as Record<string, unknown>)
      : {}

    const premiumUnlocked = sessionData.premiumUnlocked === true

    if (!premiumUnlocked) {
      return NextResponse.json({ success: false, error: 'Premium access required' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      reportId: report.id,
      premium: report.premium_result,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
