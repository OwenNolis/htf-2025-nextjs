import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { user, userAchievement, userFishSighting, userFriend } from '@/db/schema';
import { eq, and, or, sql, inArray } from 'drizzle-orm';
import { ACHIEVEMENTS } from '@/types/achievement';
import type { LeaderboardEntry, LeaderboardResponse } from '@/types/leaderboard';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const friendsOnly = url.searchParams.get('friendsOnly') === 'true';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    let userIds: string[] = [];
    
    if (friendsOnly) {
      // Get friends of the current user
      const friends = await db
        .select({ 
          userId: userFriend.friendUserId,
          friendId: userFriend.userId 
        })
        .from(userFriend)
        .where(
          and(
            or(
              eq(userFriend.userId, session.user.id),
              eq(userFriend.friendUserId, session.user.id)
            ),
            eq(userFriend.status, 'accepted')
          )
        );
      
      // Extract friend user IDs
      userIds = friends.map(f => 
        f.userId === session.user.id ? f.friendId : f.userId
      );
      
      // Always include the current user
      if (!userIds.includes(session.user.id)) {
        userIds.push(session.user.id);
      }
    } else {
      // Get all users (for global leaderboard)
      const allUsers = await db.select({ id: user.id }).from(user).limit(limit);
      userIds = allUsers.map(u => u.id);
    }

    if (userIds.length === 0) {
      return NextResponse.json({
        entries: [],
        currentUserRank: 0,
        totalParticipants: 0,
        friendsOnly
      });
    }

    // Get user data
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
      })
      .from(user)
      .where(inArray(user.id, userIds));

    // Get fish sighting counts for each user
    const fishCounts = await db
      .select({
        userId: userFishSighting.userId,
        count: sql<number>`COUNT(DISTINCT ${userFishSighting.fishId})`.as('count'),
      })
      .from(userFishSighting)
      .where(inArray(userFishSighting.userId, userIds))
      .groupBy(userFishSighting.userId);

    // Get achievement counts for each user
    const achievementCounts = await db
      .select({
        userId: userAchievement.userId,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(userAchievement)
      .where(inArray(userAchievement.userId, userIds))
      .groupBy(userAchievement.userId);

    // Get friend relationships for the current user
    const friendRelations = friendsOnly ? [] : await db
      .select({
        friendUserId: userFriend.friendUserId,
        userId: userFriend.userId,
      })
      .from(userFriend)
      .where(
        and(
          or(
            eq(userFriend.userId, session.user.id),
            eq(userFriend.friendUserId, session.user.id)
          ),
          eq(userFriend.status, 'accepted')
        )
      );

    const friendIds = friendsOnly ? userIds : friendRelations.map(fr => 
      fr.userId === session.user.id ? fr.friendUserId : fr.userId
    );

    // Create leaderboard entries
    const entries: LeaderboardEntry[] = users.map(userData => {
      const fishCount = fishCounts.find(fc => fc.userId === userData.id)?.count || 0;
      const achievementCount = achievementCounts.find(ac => ac.userId === userData.id)?.count || 0;
      const totalAchievements = ACHIEVEMENTS.length;
      const achievementProgress = totalAchievements > 0 ? (achievementCount / totalAchievements) * 100 : 0;

      return {
        userId: userData.id,
        userName: userData.name,
        userImage: userData.image || undefined,
        fishCaughtCount: fishCount,
        totalAchievements: totalAchievements,
        unlockedAchievements: achievementCount,
        achievementProgress: Math.round(achievementProgress * 100) / 100, // Round to 2 decimal places
        rank: 0, // Will be set after sorting
        isFriend: friendIds.includes(userData.id),
        isCurrentUser: userData.id === session.user.id,
      };
    });

    // Sort by achievement progress (desc), then by fish count (desc)
    entries.sort((a, b) => {
      if (a.achievementProgress !== b.achievementProgress) {
        return b.achievementProgress - a.achievementProgress;
      }
      return b.fishCaughtCount - a.fishCaughtCount;
    });

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Find current user's rank
    const currentUserRank = entries.find(e => e.isCurrentUser)?.rank || 0;

    const response: LeaderboardResponse = {
      entries,
      currentUserRank,
      totalParticipants: entries.length,
      friendsOnly
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}