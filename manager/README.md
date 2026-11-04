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

- Owner enters the new branch name, desired Netlify hostname, and branch manager email in one form.
- The provisioning function invites the email through Supabase Auth Admin API and creates the `branch_users` membership with role `branch_manager` for that branch.
- The invitation redirects to `/manager/accept-invite.html`, where the invited manager sets their own password, then logs in at `/manager/`.
- The server-side Netlify Function requires `SUPABASE_SERVICE_ROLE_KEY` as a Netlify Functions secret. Never expose this key in browser code or commit it to GitHub.
- In Supabase Authentication URL Configuration, allowlist this exact invite redirect URL while testing: `https://aura-manager-dev--aura-optikal.netlify.app/manager/accept-invite.html`.
- Configure Supabase SMTP / custom email delivery before sending real invitations. The built-in email service may have sending limits and may not deliver to arbitrary recipients.
- If an email already has a Supabase Auth account, the invite flow may reject it; use the existing-account assignment flow in Kelola Cabang instead.

## Deployment

Netlify branch deploys from `aura-manager-dev` are for testing only. Do not publish or merge this branch to production without explicit approval. Environment variables are configured as Netlify function secrets and must not be committed.


## Automatic branch provisioning

- Owner creates a branch with only its display name and desired Netlify subdomain.
- The manager checks the requested name against the Netlify account and existing Aura branch slugs.
- Netlify creates a separate Site and links it to the public GitHub repository `auraoptiksultanadam-ai/aura-web`, using `aura-manager-dev` while this feature is under development.
- The function configures site-scoped `SUPABASE_URL` and `SUPABASE_ANON_KEY` values through Netlify's environment-variable API before connecting the repository.
- The resulting `.netlify.app` hostname is registered as the branch's primary hostname in `branch_domains`.
- Netlify Site ID is retained in Netlify site metadata; the manager uses the hostname mapping as the branch-domain record.
- `NETLIFY_AUTH_TOKEN` is read only by the server-side Netlify Function. Never expose it in browser code, logs, or GitHub.
- On the Free plan, environment-variable scopes are not granular; values are site-scoped and secret. Do not create or change shared account-level variables for branch sites.
- New Sites created from the development branch are test deployments. They are not production-ready until the approved code is merged to `main` and the branch site's deploy branch is deliberately changed.
