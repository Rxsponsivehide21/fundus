-- Admin assignments are managed explicitly in Supabase, never by browser clients.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- No policies are granted to anon/authenticated. Only the service-role Edge Function
-- can read or change this table; service_role bypasses RLS.
revoke all on table public.user_roles from anon, authenticated;
grant all on table public.user_roles to service_role;
