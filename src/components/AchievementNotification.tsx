"use client";

import { Achievement } from '@/types/achievement';
import { useEffect, useState } from 'react';
import AchievementBadge from './AchievementBadge';

interface AchievementNotificationProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

export default function AchievementNotification({ 
  achievements, 
  onDismiss 
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (achievements.length > 0) {
      setIsVisible(true);
      setCurrentIndex(0);

      // Auto-dismiss after showing all achievements
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for fade out animation
      }, achievements.length * 3000 + 1000);

      return () => clearTimeout(timer);
    }
  }, [achievements, onDismiss]);

  useEffect(() => {
    if (achievements.length > 1 && isVisible) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= achievements.length) {
            clearInterval(interval);
            return prevIndex;
          }
          return nextIndex;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [achievements.length, isVisible]);

  if (achievements.length === 0 || !isVisible) {
    return null;
  }

  const currentAchievement = achievements[currentIndex];

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          bg-gradient-to-br from-dark-navy to-nautical-blue
          border-2 border-sonar-green shadow-[--shadow-cockpit]
          rounded-lg p-6 max-w-sm
          transform transition-all duration-300
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-bold text-sonar-green [text-shadow:--shadow-glow-text] font-mono">
            🎉 ACHIEVEMENT UNLOCKED!
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="text-text-secondary hover:text-white transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Achievement Content */}
        <div className="flex items-center gap-4">
          <AchievementBadge
            achievementProgress={{
              achievement: currentAchievement,
              isUnlocked: true,
              currentProgress: currentAchievement.requirement.value,
              maxProgress: currentAchievement.requirement.value,
              progressPercentage: 100,
              unlockedAt: new Date().toISOString()
            }}
            size="lg"
            showProgress={false}
          />

          <div className="flex-1">
            <div className="font-bold text-white mb-1">
              {currentAchievement.name}
            </div>
            <div className="text-sm text-text-secondary mb-2">
              {currentAchievement.description}
            </div>
            <div 
              className="text-xs font-bold"
              style={{ 
                color: currentAchievement.rarity === 'legendary' ? '#a855f7' :
                       currentAchievement.rarity === 'epic' ? '#f97316' :
                       currentAchievement.rarity === 'rare' ? '#eab308' : '#10b981'
              }}
            >
              {currentAchievement.rarity.toUpperCase()} {currentAchievement.type.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Progress Indicator for Multiple Achievements */}
        {achievements.length > 1 && (
          <div className="flex justify-center gap-1 mt-4">
            {achievements.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-sonar-green' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}

        {/* Celebration Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {/* Sparkle effects */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-warning-amber rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}