-- Store explicit administrator grants in Supabase, managed only by trusted server code.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
revoke all on table public.user_roles from anon, authenticated;
grant all on table public.user_roles to service_role;
