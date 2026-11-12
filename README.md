# MacroFit - Personal Fitness Companion

A modern web-based fitness tracking application built for personal trainers and fitness enthusiasts.

## Features

- **Dashboard** - Progress overview with BMI trend chart
- **Workout Tracker** - Add exercises, track sets, rest timer, progress
- **Exercise Library** - Curated offline exercises plus a searchable, deduplicated catalog from wger
- **BMI & Body Fat Calculators** - With history tracking
- **Workout Templates** - 7 pre-built templates (Full Body, PPL, HIIT, etc.)
- **Nutrition Food Search** - Search 30,000+ packaged foods, snacks, and drinks through Open Food Facts, with duplicate filtering and offline quick picks
- **Data Export** - CSV download + Print to PDF
- **Local Storage** - All data persists in browser

## Tech Stack

- React.js + Hooks
- LocalStorage (for MVP)
- CSS3 (Custom dark theme)
- Responsive design

## Setup Instructions

1. Clone the repository and run `npm install`.
2. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings.
3. Run `npm run dev` to start the local development server.

See [DEPLOY.md](./DEPLOY.md) for Cloudflare Pages deployment settings.

## Screenshots
*(Add 4-5 screenshots here)*

## Future Improvements
- User authentication (Firebase/Auth0)
- Backend API + Database (Node.js + MongoDB)
- Mobile PWA support
- Social sharing of progress

Nutrition product search requires an internet connection and uses the community-maintained [Open Food Facts](https://world.openfoodfacts.org/) database. Product data is supplied by contributors and may be incomplete; check package labels when accuracy matters. Open Food Facts data is available under the Open Database License (ODbL).

The online exercise catalog requires an internet connection and uses [wger](https://wger.de/). Exercise entries retain their source links and per-entry license information.
