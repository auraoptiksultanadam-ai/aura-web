revoke all on public.site_page_drafts,public.site_page_revisions from public,anon;
revoke update,delete on public.site_page_revisions from authenticated;
grant select,insert on public.site_page_revisions to authenticated;
grant select,insert,update,delete on public.site_page_drafts to authenticated;