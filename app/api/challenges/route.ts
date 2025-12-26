import { NextRequest, NextResponse } from 'next/server';
import { getDailyChallenge, ensureDailyChallengeExists } from '@/lib/dailyChallenge';
import { loadWordsServer } from '@/lib/loadWordsServer';

// Helper to normalize date (same as in dailyChallenge.ts)
function normalizeDate(date: Date): string {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  return utcDate.toISOString().split('T')[0];
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Load words on server side before validating
    loadWordsServer();
    
    // Get date from query parameter, default to today
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    
    let targetDate: Date;
    if (dateParam) {
      // Validate date format and ensure it's not in the future
      const parsedDate = new Date(dateParam);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (isNaN(parsedDate.getTime())) {
        // Invalid date format, use today
        targetDate = new Date();
      } else if (parsedDate > today) {
        // Future date, use today
        targetDate = new Date();
      } else {
        targetDate = parsedDate;
      }
    } else {
      targetDate = new Date();
    }
    
    let challenge = await getDailyChallenge(targetDate);
    let actualDate = targetDate; // Track which date we're actually using
    
    // If no challenge exists, try to create all 6 puzzles
    // This uses pre-generated word pairs from the database
    if (!challenge) {
      try {
        challenge = await ensureDailyChallengeExists(targetDate);
      } catch (error) {
        // If creation fails (no pairs available for this date), find earliest available date
        const { getEarliestAvailableDate } = await import('@/lib/dailyChallenge');
        const earliestDate = await getEarliestAvailableDate();
        
        if (earliestDate) {
          // Use the earliest available date instead
          actualDate = new Date(earliestDate);
          challenge = await getDailyChallenge(actualDate);
          
          // If still no challenge, try to create it
          if (!challenge) {
            challenge = await ensureDailyChallengeExists(actualDate);
          }
        } else {
          // No dates available at all, return error
          return NextResponse.json(
            { error: 'No puzzles available. Please ensure the database is properly set up.' },
            { status: 404 }
          );
        }
      }
    }
    
    // Ensure we have all 6 puzzles
    if (challenge && challenge.puzzles.length < 6) {
      try {
        // Some puzzles might be missing, try to create them
        challenge = await ensureDailyChallengeExists(actualDate);
      } catch (error) {
        // If creation fails, try earliest available date
        const { getEarliestAvailableDate } = await import('@/lib/dailyChallenge');
        const earliestDate = await getEarliestAvailableDate();
        
        if (earliestDate) {
          actualDate = new Date(earliestDate);
          challenge = await getDailyChallenge(actualDate);
          if (!challenge) {
            challenge = await ensureDailyChallengeExists(actualDate);
          }
        }
      }
    }
    
    // If we had to use a different date, update the challenge date
    if (challenge && normalizeDate(actualDate) !== challenge.date) {
      challenge.date = normalizeDate(actualDate);
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

