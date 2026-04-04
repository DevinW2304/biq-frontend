import { NextResponse } from 'next/server';
import { fetchJSON } from '@/lib/api';
import { TeamLeaderboardEntry } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teams = await fetchJSON<TeamLeaderboardEntry[]>('/teams/leaders?limit=30');
    return NextResponse.json(teams);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load team search data.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}