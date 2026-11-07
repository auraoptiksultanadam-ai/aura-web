# Google Maps Rating — Aura Optikal Sultan Adam

The website now has two rating placements (a compact strip after the hero and a summary in Location & Contact). Both read the same Netlify Function endpoint. No review excerpts are displayed.

## Required Netlify environment variables

Set these in **Netlify → Site configuration → Environment variables**, then redeploy the site:

- `GOOGLE_MAPS_API_KEY`: Google Cloud API key with Places API (New) enabled.
- `GOOGLE_PLACE_ID`: Place ID for the exact Aura Optikal listing at Jl. Sultan Adam RT.31, Banjarmasin.

Do not commit API keys or paste them into source files. Keep the key server-side in Netlify only.

## Google Cloud setup

1. Select/create the Google Cloud project connected to the business.
2. Enable **Places API (New)** and attach billing as required by Google.
3. Create an API key. Restrict it to Places API (New); keep it server-side (do not add HTTP referrer restrictions intended for browser keys).
4. Find and verify the Place ID against the exact Sultan Adam listing before adding it to Netlify.
5. Set both environment variables and redeploy.

The function requests only `rating`, `userRatingCount`, and `googleMapsUri`. It caches successful responses for 15 minutes. This is periodic refresh, not instant push updates. If credentials are missing or Google has no rating data, the website shows an unavailable state rather than fabricated values.

## Preview / production safety

This change is on `feature/google-maps-rating-sultan-adam`. It does not modify `main` and does not publish production by itself. Netlify Deploy Previews must be enabled to preview the branch automatically.
