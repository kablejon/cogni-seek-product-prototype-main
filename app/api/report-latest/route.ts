import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const reportId = request.nextUrl.searchParams.get('reportId')

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('analysis_reports')
      .select('id, locale, free_result, created_at')
      .eq('user_id', user.id)

    if (reportId) {
      query = query.eq('id', reportId)
    } else {
      query = query.order('created_at', { ascending: false }).limit(1)
    }

    const { data: report, error } = await query.maybeSingle()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      report: report || null,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
