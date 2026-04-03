# Basketball 101

An educational Next.js web application for learning basketball fundamentals.

## Project Structure

- `app/` — Next.js App Router pages and layout
  - `layout.tsx` — Root layout with global CSS import
  - `page.tsx` — Home page with skill category grid
  - `globals.css` — Global styles using Tailwind CSS v4
  - `fitness/`, `dribbling/`, `passing/`, `shooting/`, `basketball-iq/` — Sub-pages per skill category
- `public/images/` — Basketball player images (Kobe Bryant, Stephen Curry, etc.)
- `Old Files/` — Legacy static HTML version (kept for reference, not used)

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with `@tailwindcss/postcss`
- **Runtime**: Node.js

## Running the App

The dev server runs on port 5000:

```
npm run dev
```

The workflow "Basketball 101 Dev Server" handles this automatically.

## Key Configuration Notes

- `next.config.js` — Sets `images.unoptimized: true` and `allowedDevOrigins: ['*']` for Replit preview compatibility
- `postcss.config.js` — Uses `@tailwindcss/postcss` (Tailwind v4 syntax)
- `app/globals.css` — Uses `@import "tailwindcss"` (Tailwind v4 syntax, not `@tailwind` directives)
- `tailwind.config.js` — Present but not actively used (Tailwind v4 auto-detects content)
