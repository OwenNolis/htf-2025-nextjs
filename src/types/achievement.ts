export interface Achievement {
  id: string;
  type: 'badge' | 'milestone' | 'streak';
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: AchievementRequirement;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementRequirement {
  type: 'fish_count' | 'rarity_count' | 'streak_days' | 'specific_fish' | 'location_count' | 'speed_spotting';
  value: number;
  condition?: string; // For specific conditions like rarity type
}

export interface UserAchievement {
  id: number;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  progress?: number; // Current progress towards achievement
  createdAt: string;
}

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Fish Master Badges
  {
    id: 'deep_sea_explorer',
    type: 'badge',
    name: 'Deep Sea Explorer',
    description: 'Spotted fish at 10 different locations',
    icon: '🌊',
    category: 'exploration',
    requirement: { type: 'location_count', value: 10 },
    rarity: 'rare'
  },
  {
    id: 'rare_fish_hunter',
    type: 'badge', 
    name: 'Rare Fish Hunter',
    description: 'Spotted 5 rare fish species',
    icon: '🎯',
    category: 'collection',
    requirement: { type: 'rarity_count', value: 5, condition: 'RARE' },
    rarity: 'rare'
  },
  {
    id: 'speed_spotter',
    type: 'badge',
    name: 'Speed Spotter',
    description: 'Spotted 3 fish in one day',
    icon: '⚡',
    category: 'speed',
    requirement: { type: 'speed_spotting', value: 3 },
    rarity: 'common'
  },
  {
    id: 'epic_collector',
    type: 'badge',
    name: 'Epic Fish Collector',
    description: 'Spotted 2 epic fish species',
    icon: '👑',
    category: 'collection',
    requirement: { type: 'rarity_count', value: 2, condition: 'EPIC' },
    rarity: 'epic'
  },

  // Collection Milestones
  {
    id: 'first_catch',
    type: 'milestone',
    name: 'First Catch',
    description: 'Spotted your first fish',
    icon: '🐟',
    category: 'milestone',
    requirement: { type: 'fish_count', value: 1 },
    rarity: 'common'
  },
  {
    id: 'ten_fish_milestone',
    type: 'milestone',
    name: 'Double Digits',
    description: 'Spotted 10 different fish species',
    icon: '🔟',
    category: 'milestone',
    requirement: { type: 'fish_count', value: 10 },
    rarity: 'common'
  },
  {
    id: 'all_common_species',
    type: 'milestone',
    name: 'Common Collector',
    description: 'Spotted all common fish species',
    icon: '🏆',
    category: 'milestone',
    requirement: { type: 'rarity_count', value: 999, condition: 'COMMON' }, // Will be calculated dynamically
    rarity: 'rare'
  },
  {
    id: 'marine_master',
    type: 'milestone',
    name: 'Marine Master',
    description: 'Spotted 50 different fish species',
    icon: '🐠',
    category: 'milestone',
    requirement: { type: 'fish_count', value: 50 },
    rarity: 'epic'
  },

  // Streak Tracking
  {
    id: 'daily_spotter',
    type: 'streak',
    name: 'Daily Spotter',
    description: 'Spotted fish for 3 consecutive days',
    icon: '📅',
    category: 'consistency',
    requirement: { type: 'streak_days', value: 3 },
    rarity: 'common'
  },
  {
    id: 'weekly_explorer',
    type: 'streak',
    name: '7-Day Spotter',
    description: 'Spotted fish for 7 consecutive days',
    icon: '📊',
    category: 'consistency',
    requirement: { type: 'streak_days', value: 7 },
    rarity: 'rare'
  },
  {
    id: 'monthly_biologist',
    type: 'streak',
    name: 'Monthly Marine Biologist',
    description: 'Spotted fish for 30 consecutive days',
    icon: '🧪',
    category: 'consistency',
    requirement: { type: 'streak_days', value: 30 },
    rarity: 'legendary'
  },
  {
    id: 'dedication_master',
    type: 'streak',
    name: 'Dedication Master',
    description: 'Spotted fish for 100 consecutive days',
    icon: '💎',
    category: 'consistency',
    requirement: { type: 'streak_days', value: 100 },
    rarity: 'legendary'
  }
];