import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateChallengeCode, getDefaultChallengeExpiration } from '@/lib/challengeGenerator';

export const dynamic = 'force-dynamic';

/**
 * POST /api/challenges/create
 * Create a new challenge for a specific date
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { challenge_date, challenger_id } = body;

    if (!challenge_date) {
      return NextResponse.json(
        { error: 'challenge_date is required' },
        { status: 400 }
      );
    }

    // Generate unique challenge code
    let challengeCode: string;
    let attempts = 0;
    let isUnique = false;

    while (!isUnique && attempts < 10) {
      challengeCode = generateChallengeCode();

      // Check if code already exists
      const existingResult = await sql`
        SELECT id FROM challenges WHERE challenge_code = ${challengeCode}
      `;

      const existing = Array.isArray(existingResult) ? existingResult : [];

      if (existing.length === 0) {
        isUnique = true;
      } else {
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique challenge code' },
        { status: 500 }
      );
    }

    const expiresAt = getDefaultChallengeExpiration();

    // Create challenge
    const resultQuery = await sql`
      INSERT INTO challenges (challenge_code, challenger_id, challenge_date, status, expires_at)
      VALUES (${challengeCode!}, ${challenger_id || null}, ${challenge_date}, 'pending', ${expiresAt})
      RETURNING *
    `;

    const result = Array.isArray(resultQuery) ? resultQuery : [];

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create challenge' },
        { status: 500 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

