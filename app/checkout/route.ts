import { Checkout } from '@creem_io/nextjs'
import { NextRequest } from 'next/server'

const checkoutHandler = Checkout({
  apiKey: process.env.CREEM_API_KEY!,
  testMode: process.env.NODE_ENV !== 'production',
  defaultSuccessUrl: '/detect/report?paid=1',
})

export async function GET(request: NextRequest) {
  const reportId = request.nextUrl.searchParams.get('reportId')

  if (reportId) {
    request.nextUrl.searchParams.set('successUrl', `/detect/report?paid=1&reportId=${encodeURIComponent(reportId)}`)
  }

  return checkoutHandler(request)
}
