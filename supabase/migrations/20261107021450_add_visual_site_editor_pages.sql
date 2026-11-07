create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  page_key text not null default 'home',
  title text not null default 'Beranda',
  published_content jsonb not null default '{"version":1,"elements":{},"sections":[]}'::jsonb,
  is_published boolean not null default true,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(branch_id,page_key)
);
create table if not exists public.site_page_drafts (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  page_key text not null default 'home',
  title text not null default 'Beranda',
  content jsonb not null default '{"version":1,"elements":{},"sections":[]}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique(branch_id,page_key)
);
create table if not exists public.site_page_revisions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  page_key text not null default 'home',
  content jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists site_pages_branch_idx on public.site_pages(branch_id,page_key);
create index if not exists site_page_drafts_branch_idx on public.site_page_drafts(branch_id,page_key);
create index if not exists site_page_revisions_branch_idx on public.site_page_revisions(branch_id,page_key,created_at desc);
alter table public.site_pages enable row level security;
alter table public.site_page_drafts enable row level security;
alter table public.site_page_revisions enable row level security;
revoke all on public.site_pages,public.site_page_drafts,public.site_page_revisions from anon,authenticated;
grant select on public.site_pages to anon,authenticated;
grant select,insert,update,delete on public.site_page_drafts,public.site_page_revisions to authenticated;
drop policy if exists "Public reads published site pages" on public.site_pages;
create policy "Public reads published site pages" on public.site_pages for select to anon,authenticated using (is_published=true);
drop policy if exists "Managers read own page drafts" on public.site_page_drafts;
create policy "Managers read own page drafts" on public.site_page_drafts for select to authenticated using (public.can_manage_branch(branch_id));
drop policy if exists "Managers insert own page drafts" on public.site_page_drafts;
create policy "Managers insert own page drafts" on public.site_page_drafts for insert to authenticated with check (public.can_manage_branch(branch_id));
drop policy if exists "Managers update own page drafts" on public.site_page_drafts;
create policy "Managers update own page drafts" on public.site_page_drafts for update to authenticated using (public.can_manage_branch(branch_id)) with check (public.can_manage_branch(branch_id));
drop policy if exists "Managers read own page revisions" on public.site_page_revisions;
create policy "Managers read own page revisions" on public.site_page_revisions for select to authenticated using (public.can_manage_branch(branch_id));
drop policy if exists "Managers insert own page revisions" on public.site_page_revisions;
create policy "Managers insert own page revisions" on public.site_page_revisions for insert to authenticated with check (public.can_manage_branch(branch_id));