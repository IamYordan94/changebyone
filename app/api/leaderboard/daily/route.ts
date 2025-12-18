import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/leaderboard/daily?date=YYYY-MM-DD
 * Get daily completion leaderboard (fastest solvers who completed all 6 puzzles)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const global = searchParams.get('global') === 'true';

    if (global) {
      // Fetch global all-time best completions
      const result = await sql`
        SELECT 
          id,
          challenge_date,
          user_id,
          total_time_ms,
          completion_times,
          solution_paths,
          total_steps,
          completed_at
        FROM daily_completions
        ORDER BY total_time_ms ASC
        LIMIT 100
      `;
      return NextResponse.json(result || []);
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter required when global=false' },
        { status: 400 }
      );
    }

    // Fetch top daily completions ordered by total_time_ms (ascending = fastest)
    const result = await sql`
      SELECT 
        id,
        challenge_date,
        user_id,
        total_time_ms,
        completion_times,
        solution_paths,
        total_steps,
        completed_at
      FROM daily_completions
      WHERE challenge_date = ${date}
      ORDER BY total_time_ms ASC
      LIMIT 50
    `;

    return NextResponse.json(result || []);
  } catch (error) {
    console.error('Error in daily leaderboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

