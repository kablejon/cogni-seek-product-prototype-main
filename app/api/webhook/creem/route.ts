import { Webhook } from '@creem_io/nextjs'
import { createClient } from '@supabase/supabase-js'

// Use service-role client for server-side DB writes (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  onCheckoutCompleted: async ({ customer, metadata }) => {
    const userId = metadata?.referenceId as string
    if (!userId) {
      console.error('[creem/webhook] No referenceId in checkout metadata')
      return
    }

    console.log(`[creem/webhook] Checkout completed for user ${userId}, email: ${customer?.email}`)

    await supabaseAdmin.from('user_subscriptions').upsert(
      {
        user_id: userId,
        creem_customer_id: customer?.id ?? null,
        creem_email: customer?.email ?? null,
        subscription_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
  },

  onGrantAccess: async ({ customer, metadata }) => {
    const userId = metadata?.referenceId as string
    if (!userId) return

    console.log(`[creem/webhook] Granting access to user ${userId}`)

    await supabaseAdmin.from('user_subscriptions').upsert(
      {
        user_id: userId,
        creem_customer_id: customer?.id ?? null,
        creem_email: customer?.email ?? null,
        subscription_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
  },

  onRevokeAccess: async ({ customer, metadata }) => {
    const userId = metadata?.referenceId as string
    if (!userId) return

    console.log(`[creem/webhook] Revoking access for user ${userId}`)

    await supabaseAdmin
      .from('user_subscriptions')
      .update({
        subscription_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
  },
})
