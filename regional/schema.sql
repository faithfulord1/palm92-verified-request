-- Apply only to a newly created Supabase project whose specific primary region is Frankfurt.
-- The public API key and a caller's JWT are used by the service. Never use service_role.
create table if not exists public.verified_requests (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  claim text not null check (char_length(claim) between 1 and 4000),
  source text not null check (char_length(source) between 1 and 500),
  evidence text not null default '' check (char_length(evidence) <= 8000),
  status text not null default 'needs_review' check (status in ('needs_review','awaiting_approval','approved','rejected')),
  assessment text not null default '',
  decision_scope text not null default '',
  history jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists verified_requests_owner_idx on public.verified_requests(owner_id, created_at desc);
alter table public.verified_requests enable row level security;
revoke all on public.verified_requests from anon;
grant select, insert, update on public.verified_requests to authenticated;
create policy "read own requests" on public.verified_requests for select to authenticated using ((select auth.uid()) = owner_id);
create policy "insert own requests" on public.verified_requests for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "update own requests" on public.verified_requests for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
-- Restrict columns so clients cannot change owner_id, claim, source, evidence, or creation time.
revoke update on public.verified_requests from authenticated;
grant update (status, assessment, decision_scope, history, version, updated_at) on public.verified_requests to authenticated;
