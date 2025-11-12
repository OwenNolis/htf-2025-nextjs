"use client";

import { Achievement } from '@/types/achievement';
import { AchievementProgress } from '@/utils/achievements';

interface AchievementBadgeProps {
  achievementProgress: AchievementProgress;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function AchievementBadge({ 
  achievementProgress, 
  size = 'md', 
  showProgress = true 
}: AchievementBadgeProps) {
  const { achievement, isUnlocked, currentProgress, maxProgress, progressPercentage } = achievementProgress;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12 text-lg';
      case 'lg':
        return 'w-20 h-20 text-3xl';
      default:
        return 'w-16 h-16 text-2xl';
    }
  };

  const getRarityClasses = () => {
    if (!isUnlocked) {
      return 'bg-gray-600 border-gray-500 opacity-50';
    }
    
    switch (achievement.rarity) {
      case 'legendary':
        return 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400 shadow-purple-500/50';
      case 'epic':
        return 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-400 shadow-orange-500/50';
      case 'rare':
        return 'bg-gradient-to-br from-yellow-500 to-amber-500 border-yellow-400 shadow-yellow-500/50';
      default:
        return 'bg-gradient-to-br from-green-500 to-teal-500 border-green-400 shadow-green-500/50';
    }
  };

  const getTypeIcon = () => {
    switch (achievement.type) {
      case 'badge':
        return '🏅';
      case 'milestone':
        return '🎯';
      case 'streak':
        return '🔥';
      default:
        return achievement.icon;
    }
  };

  return (
    <div className="group relative">
      {/* Badge Circle */}
      <div
        className={`
          ${getSizeClasses()}
          ${getRarityClasses()}
          rounded-full border-2 flex items-center justify-center
          transition-all duration-300 hover:scale-110
          ${isUnlocked ? 'shadow-lg hover:shadow-xl' : ''}
        `}
      >
        <span className="filter drop-shadow-sm">
          {isUnlocked ? achievement.icon : '🔒'}
        </span>
      </div>

      {/* Progress Ring (for incomplete achievements) */}
      {showProgress && !isUnlocked && currentProgress > 0 && (
        <svg
          className={`absolute inset-0 ${getSizeClasses()} -rotate-90`}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#52ccca"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={`${progressPercentage * 2.83} 283`}
            className="transition-all duration-500"
          />
        </svg>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black border border-white/20 rounded text-xs whitespace-nowrap transition-opacity duration-200 opacity-0 group-hover:opacity-100 pointer-events-none z-[10000] min-w-max shadow-2xl">
        <div className="font-bold text-white">
          {achievement.name}
        </div>
        <div className="text-gray-300 text-[10px] mb-1">
          {achievement.description}
        </div>
        {showProgress && (
          <div className="text-yellow-400 text-[10px]">
            Progress: {currentProgress}/{maxProgress}
            {!isUnlocked && ` (${Math.round(progressPercentage)}%)`}
          </div>
        )}
        {isUnlocked && achievementProgress.unlockedAt && (
          <div className="text-green-400 text-[10px]">
            Unlocked: {new Date(achievementProgress.unlockedAt).toLocaleDateString()}
          </div>
        )}
        <div className="text-[10px] font-bold" style={{ 
          color: achievement.rarity === 'legendary' ? '#a855f7' :
                 achievement.rarity === 'epic' ? '#f97316' :
                 achievement.rarity === 'rare' ? '#eab308' : '#10b981'
        }}>
          {achievement.rarity.toUpperCase()}
        </div>
        {/* Tooltip Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
      </div>
    </div>
  );
}