-- ProofMe Supabase schema
-- Run this in Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'ProofMe User',
  username text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.skill_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id text not null check (skill_id in ('java','javascript','dsa','sql')),
  score integer not null check (score between 0 and 100),
  correct integer not null default 0 check (correct >= 0),
  total integer not null default 0 check (total >= 0),
  updated_at timestamptz not null default now(),
  unique(user_id, skill_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_slug text not null,
  status text not null check (status in ('Accepted','Wrong Answer','Compilation Error','Runtime Error')),
  passed_count integer not null default 0,
  total_count integer not null default 0,
  code text not null,
  runtime text,
  memory text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.skill_results enable row level security;
alter table public.submissions enable row level security;

-- Public profiles are intentionally readable so shareable ProofMe URLs work.
drop policy if exists "Public profiles are viewable" on public.profiles;
create policy "Public profiles are viewable"
on public.profiles for select
using (true);

-- Users can only insert/update their own profile.
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Skill results are private to their owner.
drop policy if exists "Users can view own skill results" on public.skill_results;
create policy "Users can view own skill results"
on public.skill_results for select
using (auth.uid() = user_id);

-- Public profile pages need to read skill results belonging to the selected public profile.
drop policy if exists "Public skill results are viewable" on public.skill_results;
create policy "Public skill results are viewable"
on public.skill_results for select
using (exists (select 1 from public.profiles p where p.id = skill_results.user_id));

drop policy if exists "Users can insert own skill results" on public.skill_results;
create policy "Users can insert own skill results"
on public.skill_results for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own skill results" on public.skill_results;
create policy "Users can update own skill results"
on public.skill_results for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Submissions are private to the owner.
drop policy if exists "Users can view own submissions" on public.submissions;
create policy "Users can view own submissions"
on public.submissions for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own submissions" on public.submissions;
create policy "Users can insert own submissions"
on public.submissions for insert
with check (auth.uid() = user_id);

-- Automatically create a profile row after signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  counter integer := 0;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text,1,8)), '[^a-zA-Z0-9_]', '', 'g'));
  if base_username = '' then
    base_username := 'user_' || substr(new.id::text,1,8);
  end if;
  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    counter := counter + 1;
    final_username := base_username || '_' || counter;
  end loop;

  insert into public.profiles (id, name, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'ProofMe User'), final_username)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Helpful indexes for dashboard / solved lookups
create index if not exists idx_submissions_user_status on public.submissions (user_id, status);
create index if not exists idx_submissions_user_slug on public.submissions (user_id, problem_slug);
create index if not exists idx_skill_results_dsa_score on public.skill_results (skill_id, score desc);


-- Solve time (ms) from when the user opened the problem until submit
alter table public.submissions
  add column if not exists solve_time_ms integer check (solve_time_ms is null or solve_time_ms >= 0);

-- Public aggregate: accepted distinct problems for a user (no code exposure)
create or replace function public.public_accepted_count(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct problem_slug)::integer
  from public.submissions
  where user_id = p_user_id and status = 'Accepted';
$$;

grant execute on function public.public_accepted_count(uuid) to anon, authenticated;
