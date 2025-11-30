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