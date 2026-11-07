grant select,insert,update,delete on public.site_pages to authenticated;
drop policy if exists "Managers read own published pages" on public.site_pages;
create policy "Managers read own published pages" on public.site_pages for select to authenticated using (public.can_manage_branch(branch_id));
drop policy if exists "Managers insert own published pages" on public.site_pages;
create policy "Managers insert own published pages" on public.site_pages for insert to authenticated with check (public.can_manage_branch(branch_id));
drop policy if exists "Managers update own published pages" on public.site_pages;
create policy "Managers update own published pages" on public.site_pages for update to authenticated using (public.can_manage_branch(branch_id)) with check (public.can_manage_branch(branch_id));
drop policy if exists "Managers delete own published pages" on public.site_pages;
create policy "Managers delete own published pages" on public.site_pages for delete to authenticated using (public.can_manage_branch(branch_id));