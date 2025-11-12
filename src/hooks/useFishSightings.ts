"use client";

import { useState, useCallback } from "react";

interface UseFishSightingsReturn {
  toggleSighting: (fishId: string, isCurrentlySpotted: boolean) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useFishSightings(): UseFishSightingsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSighting = async (fishId: string, currentlySpotted: boolean): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (currentlySpotted) {
        // Remove sighting
        const response = await fetch(`/api/user-sightings/${fishId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          return false; // Successfully removed
        } else if (response.status === 404) {
          // Fish was not spotted anyway, return current state
          return false;
        } else {
          throw new Error('Failed to remove fish sighting');
        }
      } else {
        // Add sighting
        const response = await fetch('/api/user-sightings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fishId }),
        });

        if (response.ok) {
          return true; // Successfully added
        } else if (response.status === 409) {
          // Fish already spotted, return spotted state
          return true;
        } else if (response.status === 401) {
          throw new Error('Please log in to mark fish as spotted');
        } else {
          throw new Error('Failed to mark fish as spotted');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };  return {
    toggleSighting,
    isLoading,
    error,
  };
}