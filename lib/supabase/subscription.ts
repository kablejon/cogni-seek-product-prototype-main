import { createClient } from '@/lib/supabase/server'

/**
 * Check if the current user has an active subscription.
 * Call from Server Components or Route Handlers.
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data } = await supabase
    .from('user_subscriptions')
    .select('subscription_active')
    .eq('user_id', user.id)
    .single()

  return data?.subscription_active === true
}

/**
 * Get subscription details for the current user.
 */
export async function getSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}
