import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { isValidChallengeCode, isChallengeExpired } from '@/lib/challengeGenerator';

export const dynamic = 'force-dynamic';

/**
 * POST /api/challenges/accept
 * Accept a challenge by code
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { challenge_code, user_id, session_id } = body;

    if (!challenge_code) {
      return NextResponse.json(
        { error: 'challenge_code is required' },
        { status: 400 }
      );
    }

    if (!isValidChallengeCode(challenge_code)) {
      return NextResponse.json(
        { error: 'Invalid challenge code format' },
        { status: 400 }
      );
    }

    // Get challenge
    const challengesResult = await sql`
      SELECT * FROM challenges WHERE challenge_code = ${challenge_code}
    `;

    const challenges = Array.isArray(challengesResult) ? challengesResult : [];

    if (challenges.length === 0) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    const challenge = challenges[0] as any;

    // Check if expired
    if (isChallengeExpired(challenge.expires_at)) {
      // Update status to expired
      await sql`
        UPDATE challenges SET status = 'expired' WHERE id = ${challenge.id}
      `;
      return NextResponse.json(
        { error: 'Challenge has expired' },
        { status: 400 }
      );
    }

    // Check if already accepted/completed
    if (challenge.status === 'completed') {
      return NextResponse.json(
        { error: 'Challenge already completed' },
        { status: 400 }
      );
    }

    // Check if user is already a participant
    const participantId = user_id || session_id;
    const existingParticipantsResult = await sql`
      SELECT * FROM challenge_participants 
      WHERE challenge_id = ${challenge.id} 
        AND (user_id = ${participantId} OR session_id = ${participantId})
    `;

    const existingParticipants = Array.isArray(existingParticipantsResult) ? existingParticipantsResult : [];

    if (existingParticipants.length > 0) {
      // Already participating, return challenge
      return NextResponse.json(challenge);
    }

    // Add participant
    await sql`
      INSERT INTO challenge_participants (challenge_id, user_id, session_id)
      VALUES (${challenge.id}, ${user_id || null}, ${session_id || null})
      ON CONFLICT (challenge_id, COALESCE(user_id, session_id)) DO NOTHING
    `;

    // Update challenge status to accepted if it was pending
    if (challenge.status === 'pending') {
      await sql`
        UPDATE challenges SET status = 'accepted' WHERE id = ${challenge.id}
      `;
    }

    // Return updated challenge
    const updatedResult = await sql`
      SELECT * FROM challenges WHERE id = ${challenge.id}
    `;

    const updated = Array.isArray(updatedResult) ? updatedResult : [];

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error accepting challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

