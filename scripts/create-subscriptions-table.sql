-- CogniSeek: user_subscriptions table
-- Run this in Supabase Dashboard > SQL Editor

create table if not exists public.user_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  creem_customer_id text,
  creem_email text,
  subscription_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint user_subscriptions_user_id_key unique (user_id)
);

-- Enable RLS
alter table public.user_subscriptions enable row level security;

-- Users can read their own subscription
create policy "Users can read own subscription"
  on public.user_subscriptions
  for select
  using (auth.uid() = user_id);

-- Service role can do everything (for webhook writes)
-- No policy needed — service role bypasses RLS
