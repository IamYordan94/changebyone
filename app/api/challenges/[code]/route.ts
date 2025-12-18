import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { isValidChallengeCode, isChallengeExpired } from '@/lib/challengeGenerator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/challenges/[code]
 * Get challenge details by code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;

    if (!isValidChallengeCode(code)) {
      return NextResponse.json(
        { error: 'Invalid challenge code format' },
        { status: 400 }
      );
    }

    // Get challenge with participants
    const challenges = await sql`
      SELECT * FROM challenges WHERE challenge_code = ${code}
    `;

    if (challenges.length === 0) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    const challenge = challenges[0];

    // Check if expired
    if (isChallengeExpired(challenge.expires_at)) {
      await sql`
        UPDATE challenges SET status = 'expired' WHERE id = ${challenge.id}
      `;
    }

    // Get participants
    const participants = await sql`
      SELECT * FROM challenge_participants 
      WHERE challenge_id = ${challenge.id}
      ORDER BY completion_time_ms ASC NULLS LAST, joined_at ASC
    `;

    // Convert participants array to object format for Challenge interface
    const participantsObj: Record<string, any> = {};
    (participants || []).forEach((p: any) => {
      const key = p.user_id || p.session_id || `participant_${p.id}`;
      participantsObj[key] = {
        user_id: p.user_id,
        completion_time_ms: p.completion_time_ms,
        completed_at: p.completed_at,
        solution_paths: p.solution_paths,
      };
    });

    return NextResponse.json({
      ...challenge,
      participants: participantsObj,
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

