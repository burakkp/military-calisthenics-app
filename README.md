# Military Calisthenics Tracker

A personal Progressive Web App for tracking military-style calisthenics workouts, weight, push-up progression, streaks, and notes.

## What is included

- React + TypeScript app with Vite
- TailwindCSS styling
- PWA install support via `vite-plugin-pwa`
- Cloudflare Pages Functions API with KV persistence
- LocalStorage offline cache and queue-based sync

## Setup

1. Install dependencies
   ```bash
   npm install
   ```
2. Create `.env` with the app secret
   ```bash
   VITE_APP_SECRET=your-secret
   ```
3. Run locally
   ```bash
   npm run dev
   ```

## Production notes

- Configure `APP_SECRET` in Cloudflare Pages and bind `FITNESS_KV` to KV namespace.
- The API route is available at `/api/progress`.
- The app uses `localStorage` to store offline state and queue updates while offline.

## Deployment

- Use Cloudflare Pages for hosting.
- Add a GitHub Actions workflow to install, build, lint, and deploy.
