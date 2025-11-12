"use client";

import { useState, useCallback } from "react";

interface UseFishSightingsReturn {
  toggleSighting: (fishId: string, isCurrentlySpotted: boolean) => Promise<boolean>;
  addSighting: (fishId: string, latitude?: number, longitude?: number, sightingDate?: Date) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useFishSightings(): UseFishSightingsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSighting = async (
    fishId: string, 
    latitude?: number, 
    longitude?: number, 
    sightingDate?: Date
  ): Promise<boolean> => {
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
        return true;
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

  const toggleSighting = async (fishId: string, currentlySpotted: boolean): Promise<boolean> => {
    if (!currentlySpotted) {
      // Add a new sighting
      await addSighting(fishId);
      return true;
    } else {
      // For now, don't remove sightings when "untoggling"
      // You already have sightings, so return true
      return true;
    }
  };

  return {
    toggleSighting,
    addSighting,
    isLoading,
    error,
  };
}