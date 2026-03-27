import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('analysis_reports')
      .select('id, locale, free_result, created_at, session_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const reports = (data || []).map((report) => {
      const sessionData = report.session_data && typeof report.session_data === 'object'
        ? (report.session_data as Record<string, unknown>)
        : {}
      const freeResult = report.free_result && typeof report.free_result === 'object'
        ? (report.free_result as Record<string, unknown>)
        : {}

      return {
        id: report.id,
        locale: report.locale,
        created_at: report.created_at,
        premium_unlocked: sessionData.premiumUnlocked === true,
        item_name: String(sessionData.itemName || sessionData.itemCustomName || ''),
        location_category: String(sessionData.locationCategory || sessionData.lossLocationCategory || ''),
        probability: Number(freeResult.probability || 0),
      }
    })

    return NextResponse.json({ success: true, reports })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
