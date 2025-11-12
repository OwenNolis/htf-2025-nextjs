"use client";

import { useState, useEffect } from 'react';
import { AchievementProgress } from '@/utils/achievements';
import AchievementBadge from './AchievementBadge';

interface AchievementPanelProps {
  achievementProgress: AchievementProgress[];
  isLoading?: boolean;
}

export default function AchievementPanel({ achievementProgress, isLoading = false }: AchievementPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'badges' | 'milestones' | 'streaks'>('all');
  const [sortBy, setSortBy] = useState<'rarity' | 'progress' | 'name'>('rarity');

  const filterAchievements = (achievements: AchievementProgress[]) => {
    let filtered = achievements;

    // Apply type/status filter
    switch (filter) {
      case 'unlocked':
        filtered = achievements.filter(ap => ap.isUnlocked);
        break;
      case 'locked':
        filtered = achievements.filter(ap => !ap.isUnlocked);
        break;
      case 'badges':
        filtered = achievements.filter(ap => ap.achievement.type === 'badge');
        break;
      case 'milestones':
        filtered = achievements.filter(ap => ap.achievement.type === 'milestone');
        break;
      case 'streaks':
        filtered = achievements.filter(ap => ap.achievement.type === 'streak');
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'rarity':
        filtered.sort((a, b) => {
          const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
          return rarityOrder[a.achievement.rarity] - rarityOrder[b.achievement.rarity];
        });
        break;
      case 'progress':
        filtered.sort((a, b) => b.progressPercentage - a.progressPercentage);
        break;
      case 'name':
        filtered.sort((a, b) => a.achievement.name.localeCompare(b.achievement.name));
        break;
    }

    return filtered;
  };

  const filteredAchievements = filterAchievements(achievementProgress);
  const unlockedCount = achievementProgress.filter(ap => ap.isUnlocked).length;
  const totalCount = achievementProgress.length;

  if (isLoading) {
    return (
      <div className="w-full bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-2 border-panel-border shadow-[--shadow-cockpit] backdrop-blur-[10px] overflow-hidden flex flex-col p-6">
        <div className="text-center">
          <div className="text-lg font-bold text-sonar-green mb-2">Loading Achievements...</div>
          <div className="w-8 h-8 border-2 border-sonar-green border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[color-mix(in_srgb,var(--color-dark-navy)_85%,transparent)] border-2 border-panel-border shadow-[--shadow-cockpit] backdrop-blur-[10px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-panel-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-sonar-green [text-shadow:--shadow-glow-text] font-mono">
              🏆 ACHIEVEMENTS
            </h3>
            <div className="text-xs text-text-secondary font-mono">
              {unlockedCount}/{totalCount} UNLOCKED
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-dark-navy border border-panel-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sonar-green to-warning-amber transition-all duration-500"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-sonar-green">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex gap-4">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'ALL' },
              { key: 'unlocked', label: 'UNLOCKED' },
              { key: 'locked', label: 'LOCKED' },
              { key: 'badges', label: 'BADGES' },
              { key: 'milestones', label: 'MILESTONES' },
              { key: 'streaks', label: 'STREAKS' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-2 py-1 text-xs font-mono rounded border transition-colors ${
                  filter === key
                    ? 'bg-sonar-green text-dark-navy border-sonar-green'
                    : 'bg-transparent text-text-secondary border-panel-border hover:text-sonar-green hover:border-sonar-green'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 py-1 text-xs font-mono bg-dark-navy border border-panel-border rounded text-text-secondary focus:outline-none focus:border-sonar-green"
          >
            <option value="rarity">Sort by Rarity</option>
            <option value="progress">Sort by Progress</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-text-secondary">
              No achievements match your current filter.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {filteredAchievements.map((achievementProgress) => (
              <div key={achievementProgress.achievement.id} className="flex flex-col items-center">
                <AchievementBadge 
                  achievementProgress={achievementProgress}
                  size="md"
                  showProgress={true}
                />
                <div className="text-xs text-center mt-2 text-text-secondary font-mono">
                  {achievementProgress.achievement.name}
                </div>
                {!achievementProgress.isUnlocked && achievementProgress.currentProgress > 0 && (
                  <div className="text-xs text-warning-amber font-mono">
                    {achievementProgress.currentProgress}/{achievementProgress.maxProgress}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}