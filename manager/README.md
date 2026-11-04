# AURA WEBSITE MANAGER

Development workspace for Aura Optikal's website manager.

- Development branch: `aura-manager-dev`
- Production branch `main` remains untouched.
- Manager frontend: `/manager/`
- Netlify Functions: `/netlify/functions/`
- Database/auth/storage: Supabase.

## Modules

- Ringkasan dashboard with role-aware navigation.
- Profil Toko: branch identity and website settings.
- Jam Operasional: seven-day branch schedule.
- Produk & Kategori: branch-scoped CRUD and image URL / upload.
- Promosi: draft, published, archived, scheduling and CTA.
- Galeri: image URL / upload, visibility and ordering.
- Kelola Cabang (Owner only): branch profiles, hostnames/domains, and assignment of existing Supabase Auth users.

## Security

- Never put Supabase service-role credentials in browser code.
- Functions use the user's Supabase session and publishable/anon key; database RLS remains authoritative.
- Manager mutations verify same-origin requests.
- Branch managers are scoped to their own branch.
- Owner-only endpoints check the authenticated role server-side.
- Storage upload uses the authenticated user token and the branch folder policy.
- Public website data resolves the request hostname through active `branch_domains`.

## Account onboarding

Create/invite the user in Supabase Authentication first, then assign the resulting Auth user UUID to a branch from the Owner's Kelola Cabang screen. This manager intentionally does not hold a service-role key and cannot create Auth users administratively.

## Deployment

Netlify branch deploys from `aura-manager-dev` are for testing only. Do not publish or merge this branch to production without explicit approval. Environment variables are configured as Netlify function secrets and must not be committed.
