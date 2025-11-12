"use client";

import { useState, useEffect } from "react";
import { Fish } from "@/types/fish";
import { useFishSightings } from "@/hooks/useFishSightings";

interface SpottedToggleProps {
  fish: Fish;
  onToggle?: (fishId: string, isSpotted: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export default function SpottedToggle({ fish, onToggle, size = "md" }: SpottedToggleProps) {
  const [isSpotted, setIsSpotted] = useState(fish.isSpotted || false);
  const { toggleSighting, isLoading, error } = useFishSightings();

  // Update local state when fish prop changes (e.g., from filtering)
  useEffect(() => {
    setIsSpotted(fish.isSpotted || false);
  }, [fish.isSpotted]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when toggling
    try {
      const newSpottedState = await toggleSighting(fish.id, isSpotted);
      setIsSpotted(newSpottedState);
      onToggle?.(fish.id, newSpottedState);
    } catch (error) {
      // Error is already handled in the hook
      console.error("Failed to toggle fish sighting:", error);
    }
  };

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3"
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${sizeClasses[size]} rounded-full transition-all duration-200 ${
        isLoading 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-110 cursor-pointer'
      } ${
        isSpotted
          ? 'bg-sonar-green text-deep-ocean hover:bg-sonar-green/80 shadow-[--shadow-glow-common]'
          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
      }`}
      title={isSpotted ? 'Mark as unseen' : 'Mark as spotted'}
    >
      {isLoading ? (
        <svg className={`${iconSizeClasses[size]} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : isSpotted ? (
        <svg className={iconSizeClasses[size]} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className={iconSizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l.546-.546M20.537 17.537L5 2" />
        </svg>
      )}
    </button>
  );
}