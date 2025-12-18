# Change by One

A daily word puzzle game where players transform one word into another by changing one letter at a time.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Neon (PostgreSQL)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Add your Neon database connection string
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the game.

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - React components
- `lib/` - Utility functions and game logic
- `types/` - TypeScript type definitions
- `contexts/` - React context providers

