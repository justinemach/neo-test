-- Run this in the Supabase dashboard → SQL Editor once your project exists.
-- Creates the table neo tester reads/writes, with public read + insert so the
-- anon key works (demo-grade; tighten before anything real).

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(body) <= 140),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "public read" on public.messages
  for select using (true);

create policy "public insert" on public.messages
  for insert with check (true);
