# Cloudflare Pages deployment

## Local development

1. Copy `.env.example` to `.env`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` using your Supabase project settings.
3. Run `npm install`, then `npm run dev`.

Do not commit `.env`. The Supabase anon/publishable key is intended for client applications; protect your data with Supabase Row Level Security policies.

## Cloudflare Pages

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Environment variables:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Set both variables in the Cloudflare Pages project settings for each deployment environment. The `public/_redirects` file configures SPA route fallback.
