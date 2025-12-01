# Bikers Alliance

>A Next.js-based marketplace and information site for bikes — listings, brands, comparisons, and a seller flow. This repository contains the frontend app, admin pages, API routes, and helper scripts used to build and run the Bikers Alliance site.

## Key Points

- **Framework:** Next.js (React) with TypeScript
- **Styling:** Tailwind CSS
- **Data / Auth:** Supabase (client libraries and server helpers)
- **Extras:** Email integrations, image assets, and a number of helper scripts for DB and URL fixes

## Features

- Browse latest and upcoming bikes, used bikes, and brand-specific pages
- Search, compare, and filter bikes by specs and body type
- Seller flow to register and list a bike for sale
- Newsletter and admin utilities (brand management, dashboards)

## Repo Structure (high level)

- `app/` – Next.js app routes and components (primary UI)
- `components/` – Shared React components
- `brand-images/` – Brand assets used across the site
- `scripts/`, `sql-queries/`, `sql-schemas/` – Maintenance and DB helper scripts
- `public/` – Static assets
- `utils/`, `lib/`, `hooks/`, `types/` – Application utilities and types

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase (Auth & Database)
- Node.js (runtime)

## Prerequisites

- Node.js (recommended v18 or later)
- npm (or yarn/pnpm) installed
- A Supabase project or similar services (if running features that require a DB/auth backend)

## Install (local)

1. Clone the repository:

```bash
git clone <repo-url>
cd BikersAlliance
```

2. Install dependencies:

```bash
npm install
```

3. Create a local `.env` file (see Environment variables below).

4. Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Available Scripts

Scripts are defined in `package.json`. Common commands:

- `npm run dev` – Start Next.js dev server
- `npm run build` – Build production bundles
- `npm run start` – Start the production server (after `build`)
- `npm run lint` – Run ESLint
- `npm run type-check` – Run TypeScript typecheck
- `npm run export` – Build and export static HTML (if desired)
- `npm run analyze` / `npm run build:analyze` – Build with bundle analyzer enabled
- `npm run perf` – Build and start for quick performance tests

Refer to `package.json` for the full script list and exact names.

## Environment Variables

This project uses environment variables for keys and configuration. Example variables you may need to set locally:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` – (optional, for server-side operations)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` – If using SMTP for emails
- `RESEND_API_KEY` or `EMAILJS_*` – For other email providers used by the project
- `NEXTAUTH_SECRET` – If NextAuth or similar is used

Check `middleware.ts`, the `app/api/` routes, or other server-side code to see which env vars are required for the specific features you intend to run.

Create a `.env.local` (gitignored) for local development and never commit secrets.

## Deployment

- Vercel is the natural choice for deploying a Next.js app; set environment variables in the Vercel project settings.
- For static export: `npm run export` will create an `out/` folder you can host on any static host (some features requiring server-side functions will not work in static mode).
- If using Supabase functions or a separate backend, ensure server keys are kept secure and not exposed in client-side env vars.

## Contributing

1. Open an issue to discuss large changes.
2. Create a feature branch from `main` (or the repo's branching guideline).
3. Implement your change and add tests where appropriate.
4. Run linters and type-checks before submitting a PR:

```bash
npm run lint
npm run type-check
```

5. Submit a pull request with a clear description of the change.

## Troubleshooting & Notes

- If you hit runtime errors related to Supabase or missing env vars, double-check your `.env.local` and the server-side code that consumes keys.
- The repo contains several helper scripts (`scripts/`) for database fixes and maintenance; read their top-level comments before running.

## Contact / Issues

Open GitHub issues in the repository for bugs or feature requests. For private or sensitive matters, contact the repo owner/maintainer directly.

## License

No license file is present in this repo by default. Add a `LICENSE` file if you intend to make this project open source (for example, `MIT`).

---

If you'd like, I can add a `README` section for developer workflows (testing, commit hooks), generate a `.env.example`, or adjust the deployment instructions for Vercel/Netlify. Tell me which you'd prefer next.
# BikersAlliance

BikersAlliance is a comprehensive motorcycle marketplace platform similar to BikeWale or BikesDekho. It provides detailed information about bikes, comparisons, reviews, dealer information, and more.

## Features

- **Browse Bikes**: Search and filter bikes by brand, category, price range, engine capacity, etc.
- **Bike Details**: Comprehensive specifications, pricing, color options, and image galleries
- **Compare Bikes**: Side-by-side comparison of up to 3 bikes with highlighted differences
- **Reviews & Ratings**: User reviews with moderation system and overall ratings
- **Dealer Locator**: Find nearby dealers with contact information and test ride requests
- **News & Articles**: Latest motorcycle news, reviews, and buying guides
- **User Accounts**: Save favorite bikes, comparisons, and manage test ride requests

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL, Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Search**: Elasticsearch/Meilisearch integration
- **Deployment**: Vercel (frontend), Postgres on managed hosting (Supabase/Neon/etc.)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bikersalliance.git
   cd bikersalliance
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/bikersalliance?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-goes-here"
   JWT_SECRET="your-jwt-secret-here"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   # or
   yarn prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.