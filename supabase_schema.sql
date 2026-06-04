-- ============================================================
-- LOVER TAG — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. LOVER TAGS TABLE
create table if not exists public.lover_tags (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  slug            text unique not null,
  boy_name        text not null,
  girl_name       text not null,
  status_text     text default 'Happily Together 💕',
  start_date      date not null,
  lover_pass      text not null,
  message         text not null,
  photos          text[] default '{}',
  quiz            jsonb default '[]',
  music_url       text,
  payment_status  text default 'unpaid',
    -- possible values: 'unpaid' | 'pending_gcash' | 'pending_admin' | 'paid'
  paymongo_ref    text,
  active          boolean default false,
  created_at      timestamptz default now()
);

-- 2. ENABLE ROW LEVEL SECURITY
alter table public.lover_tags enable row level security;

-- 3. RLS POLICIES

-- Users can only see their own tags (for dashboard)
create policy "Users can view own tags"
  on public.lover_tags for select
  using (auth.uid() = user_id);

-- Public can read active tags by slug (for /tag/:slug page)
create policy "Public can view active tags"
  on public.lover_tags for select
  using (active = true);

-- Users can insert their own tags
create policy "Users can create tags"
  on public.lover_tags for insert
  with check (auth.uid() = user_id);

-- Users can update their own tags
create policy "Users can update own tags"
  on public.lover_tags for update
  using (auth.uid() = user_id);

-- 4. STORAGE BUCKET for photos
-- Go to: Supabase Dashboard → Storage → New Bucket
-- Name: lover-photos
-- Public: YES (toggle on)
-- Run this SQL too:

insert into storage.buckets (id, name, public)
  values ('lover-photos', 'lover-photos', true)
  on conflict (id) do nothing;

-- Storage policy: authenticated users can upload
create policy "Authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'lover-photos');

-- Storage policy: public can view photos
create policy "Public can view photos"
  on storage.objects for select
  using (bucket_id = 'lover-photos');

-- ============================================================
-- DONE! Your database is ready.
-- ============================================================
