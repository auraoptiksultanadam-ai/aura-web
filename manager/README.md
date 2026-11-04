# AURA WEBSITE MANAGER

Development workspace for the Aura Optikal website manager.

- Target branch: `aura-manager-dev`
- Production website and `main` must remain unchanged during development.
- Frontend: `/manager/`
- Serverless backend: `/netlify/functions/`
- Authentication and database: Supabase.

Do not put Supabase service-role credentials in browser code. Configure secrets only as Netlify environment variables.

## Development deployment

This commit is a harmless branch-only change to trigger the first Netlify branch deployment after enabling `aura-manager-dev`. It does not change the production branch or production website.
