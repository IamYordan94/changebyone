import { NextResponse } from 'next/server';
import { getEarliestAvailableDate } from '@/lib/dailyChallenge';

export const dynamic = 'force-dynamic';

/**
 * GET /api/challenges/date-range
 * Get the available date range for challenges (earliest to today)
 */
export async function GET() {
  try {
    const earliestDate = await getEarliestAvailableDate();
    const today = new Date().toISOString().split('T')[0];
    
    return NextResponse.json({
      earliestDate: earliestDate || today, // Fallback to today if no earliest date found
      today,
    });
  } catch (error) {
    console.error('Error fetching date range:', error);
    const today = new Date().toISOString().split('T')[0];
    
    // Return today as fallback
    return NextResponse.json({
      earliestDate: today,
      today,
    });
  }
}

