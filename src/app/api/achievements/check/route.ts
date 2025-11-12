import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { userFishSighting } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { checkAndUnlockAchievements } from '@/utils/achievements';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's sightings for achievement checking
    const userSightings = await db
      .select()
      .from(userFishSighting)
      .where(eq(userFishSighting.userId, session.user.id));

    // Fetch all fish data
    const response = await fetch('http://localhost:5555/api/fish');
    if (!response.ok) {
      throw new Error('Failed to fetch fish data');
    }
    const allFish = await response.json();

    // Check for newly unlocked achievements
    const newlyUnlocked = await checkAndUnlockAchievements(
      session.user.id,
      userSightings.map(s => ({
        ...s,
        sightingDate: s.sightingDate?.toISOString() || s.spottedAt?.toISOString() || new Date().toISOString(),
        createdAt: s.createdAt.toISOString()
      })),
      allFish
    );

    return NextResponse.json({
      newlyUnlocked,
      count: newlyUnlocked.length
    });

  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}