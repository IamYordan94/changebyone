# Change by One

A daily word puzzle game where players transform one word into another by changing one letter at a time. Each day features 6 unique puzzles with word lengths ranging from 3 to 8 letters.

## Features

- **Daily Challenges**: 6 puzzles per day (one for each word length 3-8)
- **Challenge System**: Create and share challenges with friends using unique codes
- **Leaderboards**: 
  - Daily leaderboard for overall completion
  - Puzzle-specific leaderboards for each word length
  - Challenge leaderboards for shared challenges
- **Hints**: Get 2 hints per puzzle to reveal the next word in the optimal solution
- **Timer Tracking**: Automatic timer tracks your completion time
- **Date Picker**: Play previous days' puzzles using the date selector
- **Username System**: Set a username to appear on leaderboards
- **Visual Themes**: Choose from multiple color themes to personalize your experience
- **Progress Tracking**: Visual progress indicator shows completion across all 6 puzzles
- **Share Functionality**: Share your progress and challenge friends

## Tech Stack

- **Next.js 14+** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Neon PostgreSQL** - Serverless database

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Neon Database account (or any PostgreSQL database)
- Word dictionary JSON file

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env.local
```

Edit `.env.local` and add your Neon database connection string:
```env
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require
```

3. **Set up the database:**

Run the database migrations in order:
- Go to your Neon project dashboard
- Navigate to SQL Editor
- Run each migration file from `neon/migrations/` in order (001, 002, 003, etc.)

Alternatively, using psql:
```bash
psql "your_connection_string" -f neon/migrations/001_create_tables.sql
psql "your_connection_string" -f neon/migrations/002_add_word_length_to_challenges.sql
# ... continue for all migrations
```

4. **Add word dictionary:**

Place your word dictionary file in the `public/` directory:
- `public/words.json` or `public/words_6_to_8_clean.json`

The file should be formatted as:
```json
["cat", "dog", "cold", "warm", ...]
```

Or organized by length:
```json
{
  "3": ["cat", "dog", ...],
  "4": ["cold", "warm", ...],
  ...
}
```

5. **Generate word pairs (optional):**

If you need to generate word pairs for the daily schedule:
```bash
npx tsx scripts/generateWordPairs.ts
npx tsx scripts/populateDailySchedule.ts
```

6. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the game.

For more detailed setup instructions, see [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md).

## Gameplay

### How to Play

1. **Objective**: Transform the starting word into the target word by changing one letter at a time
2. **Rules**:
   - Change exactly **one letter** per move
   - Each new word must be a **valid English word**
   - You have a **limited number of moves** per puzzle
   - Complete all **6 daily puzzles** (word lengths 3-8)

### Example

Transform **CAT** → **DOG**:
```
CAT → COT → DOT → DOG ✓
```

### Scoring

- Rankings are based on **total steps** - fewer steps means a better score
- Complete all 6 daily puzzles to appear on the overall leaderboard
- Timer tracks your completion time for the full daily challenge

### Hints

- You get **2 hints per puzzle**
- Hints reveal the next word in the optimal solution path
- Use hints strategically to help when you're stuck

## API Endpoints

### Challenges

- `GET /api/challenges?date=YYYY-MM-DD` - Get daily challenge for a specific date
- `GET /api/challenges/[code]` - Get challenge by code
- `POST /api/challenges/create` - Create a new challenge
- `POST /api/challenges/accept` - Accept a challenge
- `POST /api/challenges/submit` - Submit challenge completion
- `GET /api/challenges/date-range` - Get available date range

### Solutions & Completions

- `POST /api/solutions` - Submit puzzle solution
  ```json
  {
    "challenge_date": "2024-01-01",
    "word_length": 5,
    "solution_path": ["start", "word1", "word2", "target"],
    "steps": 3,
    "username": "player1"
  }
  ```

- `POST /api/completions` - Submit daily completion
  ```json
  {
    "challenge_date": "2024-01-01",
    "solution_paths": { "3": [...], "4": [...], ... },
    "total_steps": 25,
    "username": "player1"
  }
  ```

### Leaderboards

- `GET /api/leaderboard` - Overall leaderboard
- `GET /api/leaderboard/daily?date=YYYY-MM-DD` - Daily leaderboard
- `GET /api/leaderboard/puzzle?date=YYYY-MM-DD&length=5` - Puzzle-specific leaderboard

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── challenges/   # Challenge endpoints
│   │   ├── completions/  # Completion tracking
│   │   ├── leaderboard/  # Leaderboard endpoints
│   │   └── solutions/    # Solution submission
│   ├── challenge/        # Challenge page
│   ├── cookies/          # Cookie policy page
│   ├── privacy/          # Privacy policy page
│   ├── terms/            # Terms of service page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── GameBoard.tsx    # Main game board
│   ├── WordInput.tsx    # Word input component
│   ├── Leaderboard.tsx  # Leaderboard components
│   └── ...              # Other UI components
├── contexts/            # React context providers
│   └── GameContext.tsx  # Game state management
├── hooks/               # Custom React hooks
│   └── useGame.ts       # Game hook
├── lib/                 # Utility functions and game logic
│   ├── gameLogic.ts     # Core game logic
│   ├── gameState.ts     # Game state management
│   ├── wordValidator.ts # Word validation
│   └── ...              # Other utilities
├── types/               # TypeScript type definitions
│   └── index.ts         # Type definitions
├── neon/
│   └── migrations/      # Database migration files
├── scripts/             # Utility scripts
│   ├── generateWordPairs.ts
│   ├── populateDailySchedule.ts
│   └── ...              # Other utility scripts
└── public/              # Static assets
    ├── words.json       # Word dictionary
    └── assets/          # Images and other assets
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Utility Scripts

- `npx tsx scripts/generateWordPairs.ts` - Generate word pairs
- `npx tsx scripts/populateDailySchedule.ts` - Populate daily schedule
- `npx tsx scripts/checkDatabasePairs.ts` - Check database word pairs
- `npx tsx scripts/healthCheck.ts` - Run health check
- `npx tsx scripts/verifyMigrations.ts` - Verify database migrations

## Database Setup

The application uses Neon PostgreSQL (serverless). All database migrations are located in `neon/migrations/`.

### Migration Files

1. `001_create_tables.sql` - Initial schema
2. `002_add_word_length_to_challenges.sql` - Add word length column
3. `003_create_word_pairs_table.sql` - Word pairs table
4. `004_update_max_moves.sql` - Update max moves
5. `005_add_timer_tracking.sql` - Timer tracking
6. `006_create_challenge_system.sql` - Challenge system
7. `007_drop_min_steps.sql` - Drop min_steps column
8. `008_create_daily_schedule.sql` - Daily schedule table
9. `009_username_and_steps_leaderboard.sql` - Leaderboard updates

**Important**: Run migrations in order. See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for deployment-specific migration notes.

## Deployment

For deployment instructions, see [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).

### Quick Deployment Steps

1. Push code to GitHub
2. Connect to Vercel (or your hosting platform)
3. Add `DATABASE_URL` environment variable
4. Deploy

**Note**: Ensure all database migrations are run before deploying.

## Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

### Common Issues

- **Words not loading**: Check that `words.json` exists in `public/` and is properly formatted
- **Database errors**: Verify `DATABASE_URL` is correct and includes `?sslmode=require`
- **Game not working**: Check browser console for errors
- **Migration errors**: Ensure migrations are run in order

## License

Private project - All rights reserved.
