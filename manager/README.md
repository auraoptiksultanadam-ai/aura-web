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
- Visual Editor: edit static website text, images and links directly in the page preview; add, hide, remove and reorder page sections; save drafts, publish, and restore a prior revision. Existing product, promotion, gallery and location modules remain authoritative for their dynamic data.
- Kelola Cabang (Owner only): branch profiles, hostnames/domains, and branch provisioning, domains, and account access overview.

## Security

- Never put Supabase service-role credentials in browser code.
- Functions use the user's Supabase session and publishable/anon key; database RLS remains authoritative.
- Manager mutations verify same-origin requests.
- Branch managers are scoped to their own branch.
- Owner-only endpoints check the authenticated role server-side.
- Storage upload uses the authenticated user token and the branch folder policy.
- Public website data resolves the request hostname through active `branch_domains`.
- Visual editor draft and revision tables are branch-scoped with RLS. Only published page snapshots are readable by the public site; drafts and revision history are not exposed to anonymous visitors.
- Visual editor content accepts text and safe HTTPS/local asset URLs only; arbitrary HTML and script injection are not supported.

## Account onboarding

- Owner is the account with global access to all branches, domains, and website management.
- The existing Sultan Adam account is the Master account for Sultan Adam. Its internal database role remains `branch_manager` so it cannot manage other branches.
- Other branch managers are provisioned by Owner with a unique username and initial password when a new branch is created.
- New branch manager accounts must change their initial password on first login.
- Existing Owner and Sultan Adam credentials remain usable; email login is supported alongside username login.
- Manager account usernames and password-change flags are stored in the private `manager_accounts` table. The service-role key is server-side only.
## Deployment

Netlify branch deploys from `aura-manager-dev` are for testing only. Do not publish or merge this branch to production without explicit approval. Environment variables are configured as Netlify function secrets and must not be committed.


## Automatic branch provisioning

- Owner creates a branch with its display name, desired Netlify subdomain, unique manager username, and initial password.
- The manager checks the requested name against the Netlify account and existing Aura branch slugs.
- Netlify creates a separate Site and links it to the public GitHub repository `auraoptiksultanadam-ai/aura-web`, using `aura-manager-dev` while this feature is under development.
- The function configures site-scoped `SUPABASE_URL` and `SUPABASE_ANON_KEY` values through Netlify's environment-variable API before connecting the repository.
- The resulting `.netlify.app` hostname is registered as the branch's primary hostname in `branch_domains`.
- Netlify Site ID is retained in Netlify site metadata; the manager uses the hostname mapping as the branch-domain record.
- `NETLIFY_AUTH_TOKEN` is read only by the server-side Netlify Function. Never expose it in browser code, logs, or GitHub.
- On the Free plan, environment-variable scopes are not granular; values are site-scoped and secret. Do not create or change shared account-level variables for branch sites.
- New Sites created from the development branch are test deployments. They are not production-ready until the approved code is merged to `main` and the branch site's deploy branch is deliberately changed.

## Visual Editor

- Open `/manager/visual-editor.html` after signing in.
- Select text or images directly in the website preview. Use Shift+click on a link to edit its destination.
- Use the left panel to reorder, hide/show, or remove sections; add a basic text/banner/CTA/features section.
- Use the right inspector to edit text, image URLs, upload replacement images, alt text, and link targets.
- Save Draft stores changes privately. Publish writes the public snapshot for the selected branch. Restore copies a revision back into draft; it does not publish automatically.
- The visual editor intentionally leaves dynamic catalog, gallery, promotion and location data to their existing manager modules to prevent conflicting sources of truth.
- Current editor scope is the Home page (`page_key=home`). The website's original HTML/CSS remains the layout foundation; no free-form HTML/CSS editor is provided.
