import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { DailyCompletion } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/completions
 * Record a daily completion (all 6 puzzles completed)
 */
export async function POST(request: Request) {
  try {
    const body: DailyCompletion = await request.json();

    // Validate required fields
    if (!body.challenge_date || !body.total_time_ms || !body.completion_times) {
      return NextResponse.json(
        { error: 'Missing required fields: challenge_date, total_time_ms, completion_times' },
        { status: 400 }
      );
    }

    // Validate completion_times has all 6 puzzles (3-8 letters)
    const requiredLengths = [3, 4, 5, 6, 7, 8];
    const hasAllPuzzles = requiredLengths.every(len => 
      body.completion_times[len] !== undefined && body.completion_times[len] > 0
    );

    if (!hasAllPuzzles) {
      return NextResponse.json(
        { error: 'completion_times must include all 6 puzzles (3-8 letters)' },
        { status: 400 }
      );
    }

    // Insert daily completion
    // Note: Multiple completions per user per date are allowed (no unique constraint)
    const result = await sql`
      INSERT INTO daily_completions (
        challenge_date,
        user_id,
        total_time_ms,
        completion_times,
        solution_paths,
        total_steps
      )
      VALUES (
        ${body.challenge_date},
        ${body.user_id || null},
        ${body.total_time_ms},
        ${JSON.stringify(body.completion_times)}::jsonb,
        ${body.solution_paths ? JSON.stringify(body.solution_paths) : null}::jsonb,
        ${body.total_steps || null}
      )
      RETURNING *
    `;

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Failed to save daily completion' },
        { status: 500 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error in completions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/completions?date=YYYY-MM-DD
 * Get daily completion leaderboard for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter required' },
        { status: 400 }
      );
    }

    // Fetch top daily completions ordered by total_time_ms (ascending = fastest)
    const result = await sql`
      SELECT * FROM daily_completions
      WHERE challenge_date = ${date}
      ORDER BY total_time_ms ASC
      LIMIT 20
    `;

    return NextResponse.json(result || []);
  } catch (error) {
    console.error('Error fetching daily completions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

