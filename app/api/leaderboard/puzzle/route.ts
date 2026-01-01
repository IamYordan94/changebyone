import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboard/puzzle?date=YYYY-MM-DD&wordLength=N
 * Get fewest steps for a specific puzzle (word length) on a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const wordLength = searchParams.get('wordLength');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter required' },
        { status: 400 }
      );
    }

    if (!wordLength) {
      return NextResponse.json(
        { error: 'wordLength parameter required' },
        { status: 400 }
      );
    }

    const length = parseInt(wordLength, 10);
    if (isNaN(length) || length < 3 || length > 8) {
      return NextResponse.json(
        { error: 'wordLength must be between 3 and 8' },
        { status: 400 }
      );
    }

    // Fetch top solutions for this puzzle ordered by steps (ascending = fewest steps)
    const result = await sql`
      SELECT 
        id,
        challenge_date,
        word_length,
        solution_path,
        steps,
        username,
        user_id,
        created_at
      FROM user_solutions
      WHERE challenge_date = ${date} 
        AND word_length = ${length}
      ORDER BY steps ASC
      LIMIT 50
    `;

    return NextResponse.json(result || []);
  } catch (error) {
    console.error('Error in puzzle leaderboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

