"use client";

import { useState, useEffect } from "react";
import { Fish, FilterType } from "@/types/fish";
import { fetchFishesWithSightings } from "@/lib/fish-with-sightings";
import { useFishSightings } from "@/hooks/useFishSightings";
import FishCard from "./FishCard";

export default function CatalogClient() {
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [filteredFishes, setFilteredFishes] = useState<Fish[]>([]);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredFish, setHoveredFish] = useState<string | null>(null);
  const { toggleSighting } = useFishSightings();

  useEffect(() => {
    loadFishes();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [fishes, filterType]);

  const loadFishes = async () => {
    try {
      setIsLoading(true);
      const fishData = await fetchFishesWithSightings();
      setFishes(fishData);
    } catch (error) {
      console.error("Failed to load fishes:", error);
      setError("Failed to load fish catalog");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...fishes];
    
    switch (filterType) {
      case "spotted":
        filtered = fishes.filter(fish => fish.isSpotted);
        break;
      case "unseen":
        filtered = fishes.filter(fish => !fish.isSpotted);
        break;
      case "all":
      default:
        // Keep all fishes
        break;
    }

    setFilteredFishes(filtered);
  };

  const handleFishToggle = async (fishId: string, isSpotted: boolean) => {
    try {
      const newSpottedState = await toggleSighting(fishId, isSpotted);
      // Update local state to reflect the change
      setFishes(prevFishes =>
        prevFishes.map(fish =>
          fish.id === fishId
            ? { ...fish, isSpotted: newSpottedState, spottedAt: newSpottedState ? new Date().toISOString() : undefined }
            : fish
        )
      );
    } catch (error) {
      // Error is already handled in the hook, but we can add toast notifications here if needed
      console.error("Failed to toggle fish sighting:", error);
    }
  };

  const getFilterCounts = () => {
    const spotted = fishes.filter(fish => fish.isSpotted).length;
    const unseen = fishes.filter(fish => !fish.isSpotted).length;
    const total = fishes.length;
    
    return { spotted, unseen, total };
  };

  const counts = getFilterCounts();

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">⚠️ {error}</div>
        <button 
          onClick={loadFishes}
          className="px-4 py-2 bg-sonar-green text-deep-ocean rounded hover:bg-sonar-green/80 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-panel-bg border border-panel-border rounded-lg p-4">
        <h3 className="text-text-primary font-bold mb-4">Filter Species</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded text-sm transition-all ${
              filterType === "all"
                ? "bg-sonar-green text-deep-ocean font-bold shadow-[--shadow-glow-common]"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
          >
            All Species ({counts.total})
          </button>
          <button
            onClick={() => setFilterType("spotted")}
            className={`px-4 py-2 rounded text-sm transition-all ${
              filterType === "spotted"
                ? "bg-sonar-green text-deep-ocean font-bold shadow-[--shadow-glow-common]"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
          >
            Spotted ({counts.spotted})
          </button>
          <button
            onClick={() => setFilterType("unseen")}
            className={`px-4 py-2 rounded text-sm transition-all ${
              filterType === "unseen"
                ? "bg-sonar-green text-deep-ocean font-bold shadow-[--shadow-glow-common]"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
          >
            Unseen ({counts.unseen})
          </button>
        </div>
      </div>

      {/* Fish Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-2 border-sonar-green border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-text-secondary">Loading fish catalog...</div>
        </div>
      ) : filteredFishes.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          {filterType === "all" ? (
            "No fish species found"
          ) : filterType === "spotted" ? (
            "You haven't spotted any fish yet. Start exploring!"
          ) : (
            "You've spotted all available fish! Great job! 🎉"
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFishes.map((fish) => (
            <div
              key={fish.id}
              className={`relative transition-all duration-300 ${
                hoveredFish === fish.id ? "scale-[1.02]" : ""
              } ${
                fish.isSpotted 
                  ? "ring-2 ring-sonar-green/30 shadow-[--shadow-glow-common]" 
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <div className={`relative ${fish.isSpotted ? "" : "grayscale hover:grayscale-0 transition-all duration-300"}`}>
                <FishCard 
                  fish={fish} 
                  onHover={setHoveredFish}
                />
                {fish.isSpotted && (
                  <div className="absolute top-2 left-2 bg-sonar-green text-deep-ocean px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    SPOTTED
                  </div>
                )}
              </div>
              <div className="mt-2 px-2">
                <button
                  onClick={() => handleFishToggle(fish.id, !fish.isSpotted)}
                  className={`w-full py-2 px-3 rounded text-sm font-medium transition-all duration-200 ${
                    fish.isSpotted
                      ? "bg-sonar-green text-deep-ocean hover:bg-sonar-green/80 shadow-lg"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white"
                  }`}
                >
                  {fish.isSpotted ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Spotted
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Mark as Spotted
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}