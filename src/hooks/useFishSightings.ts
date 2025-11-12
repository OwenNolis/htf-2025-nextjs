"use client";

import { useState, useCallback } from "react";
import { Achievement } from "@/types/achievement";

interface UseFishSightingsReturn {
  toggleSighting: (fishId: string, isCurrentlySpotted: boolean) => Promise<{ success: boolean; newAchievements?: Achievement[] }>;
  addSighting: (fishId: string, latitude?: number, longitude?: number, sightingDate?: Date) => Promise<{ success: boolean; newAchievements?: Achievement[] }>;
  isLoading: boolean;
  error: string | null;
}

export function useFishSightings(): UseFishSightingsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAchievements = async (): Promise<Achievement[]> => {
    try {
      const response = await fetch('/api/achievements/check', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        return data.newlyUnlocked || [];
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
    return [];
  };

  const addSighting = async (
    fishId: string, 
    latitude?: number, 
    longitude?: number, 
    sightingDate?: Date
  ): Promise<{ success: boolean; newAchievements?: Achievement[] }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user-sightings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fishId,
          latitude,
          longitude,
          sightingDate: sightingDate?.toISOString() || new Date().toISOString()
        }),
      });

      if (response.ok) {
        // Check for new achievements after adding sighting
        const newAchievements = await checkAchievements();
        return { success: true, newAchievements };
      } else if (response.status === 401) {
        throw new Error('Please log in to mark fish as spotted');
      } else {
        throw new Error('Failed to add fish sighting');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSighting = async (fishId: string, currentlySpotted: boolean): Promise<{ success: boolean; newAchievements?: Achievement[] }> => {
    if (!currentlySpotted) {
      // Add a new sighting and check for achievements
      return await addSighting(fishId);
    } else {
      // For now, don't remove sightings when "untoggling"
      // You already have sightings, so return true
      return { success: true };
    }
  };

  return {
    toggleSighting,
    addSighting,
    isLoading,
    error,
  };
}