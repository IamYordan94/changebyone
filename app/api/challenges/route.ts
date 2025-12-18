import { NextResponse } from 'next/server';
import { getDailyChallenge, ensureDailyChallengeExists } from '@/lib/dailyChallenge';
import { loadWordsServer } from '@/lib/loadWordsServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Load words on server side before validating
    loadWordsServer();
    
    const today = new Date();
    let challenge = await getDailyChallenge(today);
    
    // If no challenge exists, create all 6 puzzles
    // This uses pre-generated word pairs from the database
    if (!challenge) {
      challenge = await ensureDailyChallengeExists(today);
    }
    
    // Ensure we have all 6 puzzles
    if (challenge && challenge.puzzles.length < 6) {
      // Some puzzles might be missing, try to create them
      challenge = await ensureDailyChallengeExists(today);
    }
    
    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Error fetching daily challenge:', error);
    
    // Provide more detailed error message
    let errorMessage = 'Failed to load daily challenge';
    if (error instanceof Error) {
      // Check for database constraint errors
      if (error.message.includes('min_steps') || error.message.includes('23502')) {
        errorMessage = 'Database schema error: Please run migration 007_drop_min_steps.sql in your Neon database';
      } else if (error.message.includes('No word pairs available')) {
        errorMessage = 'No word pairs found in database. Please run the word pair generation script.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

