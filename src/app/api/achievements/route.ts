import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { userAchievement, userFishSighting } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { AchievementCalculator, checkAndUnlockAchievements } from '@/utils/achievements';
import { ACHIEVEMENTS } from '@/types/achievement';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's unlocked achievements
    const unlockedAchievements = await db
      .select()
      .from(userAchievement)
      .where(eq(userAchievement.userId, session.user.id));

    // Get user's sightings for progress calculation
    const userSightings = await db
      .select()
      .from(userFishSighting)
      .where(eq(userFishSighting.userId, session.user.id));

    // Fetch all fish data for calculations
    const response = await fetch('http://localhost:5555/api/fish');
    if (!response.ok) {
      throw new Error('Failed to fetch fish data');
    }
    const allFish = await response.json();

    console.log('Debug - User ID:', session.user.id);
    console.log('Debug - User sightings count:', userSightings.length);
    console.log('Debug - All fish count:', allFish.length);
    console.log('Debug - Unlocked achievements:', unlockedAchievements.length);
    console.log('Debug - Unlocked achievement IDs:', unlockedAchievements.map(ua => ua.achievementId));

    // Calculate progress for all achievements
    const calculator = new AchievementCalculator(
      session.user.id,
      userSightings.map(s => ({
        ...s,
        sightingDate: s.sightingDate?.toISOString() || s.spottedAt?.toISOString() || new Date().toISOString(),
        createdAt: s.createdAt.toISOString()
      })),
      allFish,
      unlockedAchievements.map(ua => ({
        ...ua,
        unlockedAt: ua.unlockedAt.toISOString(),
        createdAt: ua.createdAt.toISOString()
      }))
    );

    // Check for and unlock any new achievements before calculating progress
    const newlyUnlocked = await checkAndUnlockAchievements(
      session.user.id,
      userSightings.map(s => ({
        ...s,
        sightingDate: s.sightingDate?.toISOString() || s.spottedAt?.toISOString() || new Date().toISOString(),
        createdAt: s.createdAt.toISOString()
      })),
      allFish
    );

    // If new achievements were unlocked, re-fetch the unlocked achievements
    let finalUnlockedAchievements = unlockedAchievements;
    if (newlyUnlocked.length > 0) {
      finalUnlockedAchievements = await db
        .select()
        .from(userAchievement)
        .where(eq(userAchievement.userId, session.user.id));
    }

    // Recalculate with updated achievements
    const finalCalculator = new AchievementCalculator(
      session.user.id,
      userSightings.map(s => ({
        ...s,
        sightingDate: s.sightingDate?.toISOString() || s.spottedAt?.toISOString() || new Date().toISOString(),
        createdAt: s.createdAt.toISOString()
      })),
      allFish,
      finalUnlockedAchievements.map(ua => ({
        ...ua,
        unlockedAt: ua.unlockedAt.toISOString(),
        createdAt: ua.createdAt.toISOString()
      }))
    );

    const achievementProgress = finalCalculator.calculateAllProgress();

    return NextResponse.json({
      achievements: achievementProgress,
      summary: {
        total: ACHIEVEMENTS.length,
        unlocked: finalUnlockedAchievements.length,
        unlockedPercentage: (finalUnlockedAchievements.length / ACHIEVEMENTS.length) * 100
      }
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { achievementId } = await request.json();

    if (!achievementId) {
      return NextResponse.json(
        { error: 'Achievement ID is required' },
        { status: 400 }
      );
    }

    // Check if achievement exists
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    // Check if already unlocked
    const existing = await db
      .select()
      .from(userAchievement)
      .where(
        eq(userAchievement.userId, session.user.id) &&
        eq(userAchievement.achievementId, achievementId)
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Achievement already unlocked' },
        { status: 409 }
      );
    }

    // Unlock the achievement
    const now = new Date();
    const newAchievement = await db.insert(userAchievement).values({
      id: `${session.user.id}_${achievementId}_${now.getTime()}`,
      userId: session.user.id,
      achievementId,
      unlockedAt: now,
      createdAt: now,
    }).returning();

    return NextResponse.json({
      success: true,
      achievement: {
        ...newAchievement[0],
        unlockedAt: newAchievement[0].unlockedAt.toISOString(),
        createdAt: newAchievement[0].createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    );
  }
}