import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    // Fetch top solutions for the date (and word length if provided), ordered by steps (ascending)
    let result;
    if (wordLength) {
      result = await sql`
        SELECT * FROM user_solutions
        WHERE challenge_date = ${date} AND word_length = ${parseInt(wordLength, 10)}
        ORDER BY steps ASC
        LIMIT 10
      `;
    } else {
      result = await sql`
        SELECT * FROM user_solutions
        WHERE challenge_date = ${date}
        ORDER BY steps ASC
        LIMIT 10
      `;
    }

    return NextResponse.json(result || []);
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

