import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

function verifyRedirectSignature(params: Record<string, string | null>, apiKey: string) {
  const signature = params.signature
  if (!signature) return false

  const sortedParams = Object.keys(params)
    .filter((key) => key !== 'signature' && params[key] !== null && params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  const expectedSignature = crypto
    .createHmac('sha256', apiKey)
    .update(sortedParams)
    .digest('hex')

  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.CREEM_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Missing CREEM_API_KEY' }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const params = {
      checkout_id: body.checkout_id ?? null,
      order_id: body.order_id ?? null,
      customer_id: body.customer_id ?? null,
      subscription_id: body.subscription_id ?? null,
      product_id: body.product_id ?? null,
      request_id: body.request_id ?? null,
      signature: body.signature ?? null,
    }

    if (!params.checkout_id || !params.product_id || !params.signature) {
      return NextResponse.json({ success: false, error: 'Missing required redirect params' }, { status: 400 })
    }

    const valid = verifyRedirectSignature(params, apiKey)
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert(
        {
          user_id: user.id,
          creem_customer_id: params.customer_id,
          subscription_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
