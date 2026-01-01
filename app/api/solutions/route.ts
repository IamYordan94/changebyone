import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { UserSolution } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Fully anonymous mode: we don't provide a per-user solutions endpoint because
  // there is no trusted identity to scope results to. "My Stats" is local-only.
  return NextResponse.json(
    { error: 'Not available in anonymous mode' },
    { status: 405 }
  );
}

export async function POST(request: Request) {
  try {
    const body: UserSolution = await request.json();

    // Validate solution
    if (!body.challenge_date || !body.solution_path || body.steps === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // word_length is required (default to 3 if not provided for backward compatibility)
    const wordLength = body.word_length || 3;

    // Insert solution with username
    const resultQuery = await sql`
      INSERT INTO user_solutions (
        challenge_date, 
        word_length, 
        solution_path, 
        steps, 
        user_id,
        username
      )
      VALUES (
        ${body.challenge_date}, 
        ${wordLength}, 
        ${body.solution_path}, 
        ${body.steps}, 
        ${body.user_id || null},
        ${body.username || 'Anonymous'}
      )
      RETURNING *
    `;

    const result = Array.isArray(resultQuery) ? resultQuery : [];

    if (!result || result.length === 0) {
      console.error('Error saving solution');
      return NextResponse.json(
        { error: 'Failed to save solution' },
        { status: 500 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error in solutions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

