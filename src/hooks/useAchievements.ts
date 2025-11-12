"use client";

import { useState, useEffect, useCallback } from 'react';
import { Achievement } from '@/types/achievement';
import { AchievementProgress } from '@/utils/achievements';

interface UseAchievementsResult {
  achievements: AchievementProgress[];
  isLoading: boolean;
  error: string | null;
  refetchAchievements: () => Promise<void>;
  checkForNewAchievements: () => Promise<Achievement[]>;
  summary: {
    total: number;
    unlocked: number;
    unlockedPercentage: number;
  } | null;
}

export function useAchievements(): UseAchievementsResult {
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [summary, setSummary] = useState<UseAchievementsResult['summary']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/achievements');
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const data = await response.json();
      setAchievements(data.achievements || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching achievements:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkForNewAchievements = useCallback(async (): Promise<Achievement[]> => {
    try {
      const response = await fetch('/api/achievements/check', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to check achievements');
      }

      const data = await response.json();
      
      // If new achievements were unlocked, refresh the full list
      if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
        await fetchAchievements();
      }

      return data.newlyUnlocked || [];
    } catch (err) {
      console.error('Error checking achievements:', err);
      return [];
    }
  }, [fetchAchievements]);

  // Initial fetch
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    isLoading,
    error,
    refetchAchievements: fetchAchievements,
    checkForNewAchievements,
    summary
  };
}