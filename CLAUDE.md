# Dashboard — Supabase Setup

## SQL — run once in the Supabase SQL editor

```sql
-- 1. Create the shared state table
create table if not exists public.app_state (
  key        text        primary key,
  value      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2. Row-level security (required for anon key access)
alter table public.app_state enable row level security;

create policy "anon select" on public.app_state
  for select using (true);

create policy "anon insert" on public.app_state
  for insert with check (true);

create policy "anon update" on public.app_state
  for update using (true) with check (true);

-- 3. Enable realtime for live cross-device sync
alter publication supabase_realtime add table public.app_state;
```

## APP_KEY registry (one row per page)

| File        | APP_KEY    |
|-------------|------------|
| index.html  | goals      |

Add a row here whenever you add sync to a new page so keys never collide.

## Credentials

```
SUPABASE_URL = https://givlkapqrngvvaisilbd.supabase.co
SUPABASE_KEY = sb_publishable_sB3v-SAv7hXx1gD9BluXsQ_TLTc4cyn
```
