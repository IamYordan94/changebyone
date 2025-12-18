import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { DailyCompletion } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/challenges/submit
 * Submit challenge completion
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { challenge_code, user_id, session_id, total_time_ms, completion_times, solution_paths, total_steps } = body;

    if (!challenge_code || !total_time_ms || !completion_times) {
      return NextResponse.json(
        { error: 'Missing required fields: challenge_code, total_time_ms, completion_times' },
        { status: 400 }
      );
    }

    // Get challenge
    const challenges = await sql`
      SELECT * FROM challenges WHERE challenge_code = ${challenge_code}
    `;

    if (challenges.length === 0) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    const challenge = challenges[0];

    // Get participant
    const participantId = user_id || session_id;
    const participants = await sql`
      SELECT * FROM challenge_participants 
      WHERE challenge_id = ${challenge.id} 
        AND (user_id = ${participantId} OR session_id = ${participantId})
    `;

    if (participants.length === 0) {
      return NextResponse.json(
        { error: 'Not a participant in this challenge' },
        { status: 403 }
      );
    }

    const participant = participants[0];

    // Update participant with completion data
    await sql`
      UPDATE challenge_participants
      SET 
        completion_time_ms = ${total_time_ms},
        total_steps = ${total_steps || null},
        solution_paths = ${solution_paths ? JSON.stringify(solution_paths) : null}::jsonb,
        completed_at = NOW()
      WHERE id = ${participant.id}
    `;

    // Check if all participants have completed
    const allParticipants = await sql`
      SELECT * FROM challenge_participants WHERE challenge_id = ${challenge.id}
    `;

    const allCompleted = allParticipants.every((p: any) => p.completion_time_ms !== null);

    if (allCompleted && challenge.status !== 'completed') {
      await sql`
        UPDATE challenges SET status = 'completed' WHERE id = ${challenge.id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting challenge completion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

