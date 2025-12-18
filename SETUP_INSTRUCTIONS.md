# Word Ladder Game - Setup Instructions

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Neon Database Account** - Create a new project and get your connection string
3. **Word Dictionary JSON File** - Your word list file (2-8 letter words)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
```

Get your connection string from your Neon project dashboard.

### 3. Set Up Neon Database

Run the migration file to create the necessary tables:

1. Go to your Neon project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `neon/migrations/001_create_tables.sql`
4. Run the migration

Alternatively, you can use the Neon CLI or connect via psql:
```bash
psql "your_connection_string" -f neon/migrations/001_create_tables.sql
```

### 4. Add Word Dictionary

**IMPORTANT**: You need to provide your word JSON file.

**Option A: Place in public folder**
- Create `public/words.json`
- The file should be either:
  - An array: `["cat", "dog", "cold", "warm", ...]`
  - An object by length: `{ "3": ["cat", "dog", ...], "4": ["cold", "warm", ...] }`

**Option B: Import directly**
- Place `words.json` in a `data/` folder
- Update `lib/loadWords.ts` to import it directly

**Option C: Load dynamically**
- Update `lib/loadWords.ts` to fetch from your preferred location

### 5. Initialize Word Dictionary

The word dictionary needs to be loaded when the app starts. Update `app/layout.tsx` or create a client component that calls `initializeWordDictionary()` on mount.

Example:
```typescript
'use client';
import { useEffect } from 'react';
import { initializeWordDictionary } from '@/lib/loadWords';

export default function WordLoader() {
  useEffect(() => {
    initializeWordDictionary();
  }, []);
  return null;
}
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the game.

## Next Steps

1. **Test the game** - Make sure word validation works
2. **Add daily challenges** - Pre-generate word pairs and store them in Neon
3. **Deploy to Vercel** - Connect your GitHub repo and deploy

## Troubleshooting

- **Words not loading**: Check that `words.json` is accessible and in the correct format
- **Database errors**: Verify your DATABASE_URL environment variable is correct and includes `?sslmode=require`
- **Game not working**: Check browser console for errors

## Production Deployment

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

