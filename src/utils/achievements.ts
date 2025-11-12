import { Achievement, ACHIEVEMENTS, UserAchievement } from '@/types/achievement';
import { Fish, UserFishSighting } from '@/types/fish';
import { db } from '@/db';
import { userAchievement, userFishSighting } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface AchievementProgress {
  achievement: Achievement;
  isUnlocked: boolean;
  currentProgress: number;
  maxProgress: number;
  progressPercentage: number;
  unlockedAt?: string;
}

export class AchievementCalculator {
  private userId: string;
  private userSightings: UserFishSighting[];
  private allFish: Fish[];
  private unlockedAchievements: UserAchievement[];

  constructor(userId: string, userSightings: UserFishSighting[], allFish: Fish[], unlockedAchievements: UserAchievement[] = []) {
    this.userId = userId;
    this.userSightings = userSightings;
    this.allFish = allFish;
    this.unlockedAchievements = unlockedAchievements;
  }

  // Calculate progress for all achievements
  calculateAllProgress(): AchievementProgress[] {
    return ACHIEVEMENTS.map(achievement => this.calculateAchievementProgress(achievement));
  }

  // Calculate progress for a specific achievement
  calculateAchievementProgress(achievement: Achievement): AchievementProgress {
    const unlockedData = this.unlockedAchievements.find(ua => ua.achievementId === achievement.id);
    const isUnlocked = !!unlockedData;

    let currentProgress = 0;
    let maxProgress = achievement.requirement.value;

    switch (achievement.requirement.type) {
      case 'fish_count':
        currentProgress = this.getUniqueSpottedFishCount();
        break;
      
      case 'rarity_count':
        currentProgress = this.getRarityCount(achievement.requirement.condition as string);
        
        // For "all common species" achievement, calculate max dynamically
        if (achievement.id === 'all_common_species') {
          maxProgress = this.getAllFishByRarity('COMMON').length;
        }
        break;
      
      case 'streak_days':
        currentProgress = this.getCurrentStreakDays();
        break;
      
      case 'location_count':
        currentProgress = this.getUniqueLocationCount();
        break;
      
      case 'speed_spotting':
        currentProgress = this.getMaxFishInOneDay();
        break;
      
      default:
        currentProgress = 0;
    }

    // Cap progress at max
    const cappedProgress = Math.min(currentProgress, maxProgress);
    const progressPercentage = maxProgress > 0 ? (cappedProgress / maxProgress) * 100 : 0;

    return {
      achievement,
      isUnlocked,
      currentProgress: cappedProgress,
      maxProgress,
      progressPercentage,
      unlockedAt: unlockedData?.unlockedAt
    };
  }

  // Get newly unlocked achievements (compare current progress with unlocked status)
  getNewlyUnlockedAchievements(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      const progress = this.calculateAchievementProgress(achievement);
      
      // If achievement is completed but not yet unlocked
      if (progress.currentProgress >= progress.maxProgress && !progress.isUnlocked) {
        newlyUnlocked.push(achievement);
      }
    }
    
    return newlyUnlocked;
  }

  // Helper methods for calculations
  private getUniqueSpottedFishCount(): number {
    const uniqueFishIds = new Set(this.userSightings.map(s => s.fishId));
    return uniqueFishIds.size;
  }

  private getRarityCount(rarity: string): number {
    const spottedFishIds = new Set(this.userSightings.map(s => s.fishId));
    const fishByRarity = this.getAllFishByRarity(rarity);
    
    let count = 0;
    for (const fish of fishByRarity) {
      if (spottedFishIds.has(fish.id)) {
        count++;
      }
    }
    return count;
  }

  private getAllFishByRarity(rarity: string): Fish[] {
    return this.allFish.filter(fish => fish.rarity.toUpperCase() === rarity.toUpperCase());
  }

  private getCurrentStreakDays(): number {
    if (this.userSightings.length === 0) return 0;

    // Sort sightings by date (most recent first)
    const sortedSightings = [...this.userSightings].sort(
      (a, b) => new Date(b.sightingDate).getTime() - new Date(a.sightingDate).getTime()
    );

    // Get unique days (remove time component)
    const uniqueDays = [...new Set(
      sortedSightings.map(s => {
        const date = new Date(s.sightingDate);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
    )];

    if (uniqueDays.length === 0) return 0;

    // Check if the most recent day is today or yesterday
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

    const mostRecentDay = uniqueDays[0];
    
    // If the most recent sighting is not today or yesterday, streak is broken
    if (mostRecentDay !== todayStr && mostRecentDay !== yesterdayStr) {
      return 0;
    }

    // Count consecutive days going backwards
    let streakCount = 1;
    let currentDate = new Date(mostRecentDay === todayStr ? today : yesterday);

    for (let i = 1; i < uniqueDays.length; i++) {
      currentDate.setDate(currentDate.getDate() - 1);
      const expectedDateStr = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
      
      if (uniqueDays[i] === expectedDateStr) {
        streakCount++;
      } else {
        break;
      }
    }

    return streakCount;
  }

  private getUniqueLocationCount(): number {
    const uniqueLocations = new Set();
    
    for (const sighting of this.userSightings) {
      if (sighting.latitude && sighting.longitude) {
        // Round to 3 decimal places to group nearby locations
        const lat = parseFloat(sighting.latitude).toFixed(3);
        const lng = parseFloat(sighting.longitude).toFixed(3);
        uniqueLocations.add(`${lat},${lng}`);
      }
    }
    
    return uniqueLocations.size;
  }

  private getMaxFishInOneDay(): number {
    if (this.userSightings.length === 0) return 0;

    // Group sightings by date
    const sightingsByDate = new Map<string, UserFishSighting[]>();
    
    for (const sighting of this.userSightings) {
      const date = new Date(sighting.sightingDate);
      const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      if (!sightingsByDate.has(dateStr)) {
        sightingsByDate.set(dateStr, []);
      }
      sightingsByDate.get(dateStr)!.push(sighting);
    }

    // Find the day with the most unique fish spotted
    let maxFishInDay = 0;
    
    for (const [date, sightings] of sightingsByDate) {
      const uniqueFishIds = new Set(sightings.map(s => s.fishId));
      maxFishInDay = Math.max(maxFishInDay, uniqueFishIds.size);
    }

    return maxFishInDay;
  }
}

// Utility function to unlock achievements for a user
export async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
  try {
    // Check if achievement is already unlocked
    const existing = await db
      .select()
      .from(userAchievement)
      .where(
        and(
          eq(userAchievement.userId, userId),
          eq(userAchievement.achievementId, achievementId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return; // Already unlocked
    }

    // Unlock the achievement
    await db.insert(userAchievement).values({
      id: `${userId}_${achievementId}_${Date.now()}`,
      userId,
      achievementId,
      unlockedAt: new Date(),
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error unlocking achievement:', error);
  }
}

// Function to check and unlock new achievements after a sighting
export async function checkAndUnlockAchievements(
  userId: string,
  userSightings: UserFishSighting[],
  allFish: Fish[]
): Promise<Achievement[]> {
  try {
    // Get current unlocked achievements
    const unlockedAchievements = await db
      .select()
      .from(userAchievement)
      .where(eq(userAchievement.userId, userId));

    // Calculate what should be unlocked
    const calculator = new AchievementCalculator(userId, userSightings, allFish, unlockedAchievements);
    const newlyUnlocked = calculator.getNewlyUnlockedAchievements();

    // Unlock new achievements
    for (const achievement of newlyUnlocked) {
      await unlockAchievement(userId, achievement.id);
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}