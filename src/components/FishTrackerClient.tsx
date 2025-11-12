"use client";

import { useState, useEffect } from "react";
import { Fish } from "@/types/fish";
import Map from "./Map";
import FishList from "./FishList";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface FishTrackerClientProps {
  fishes: Fish[];
  sortedFishes: Fish[];
}

export default function FishTrackerClient({
  fishes,
  sortedFishes,
}: FishTrackerClientProps) {
  const [hoveredFishId, setHoveredFishId] = useState<string | null>(null);
  const [fishList, setFishList] = useState<Fish[]>(sortedFishes);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFishUpdate = (updatedFish: Fish) => {
    setFishList(prevFishes =>
      prevFishes.map(fish =>
        fish.id === updatedFish.id ? updatedFish : fish
      )
    );
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-gray-800 animate-pulse" />
        <div className="h-64 bg-gray-900 animate-pulse" />
      </div>
    );
  }

  return (
    <PanelGroup
      direction="vertical"
      className="flex-1"
      id="fish-tracker-panels"
    >
      {/* Map Panel */}
      <Panel defaultSize={65} minSize={30}>
        <div className="w-full h-full relative shadow-[--shadow-map-panel]">
          <Map fishes={fishes} hoveredFishId={hoveredFishId} />
        </div>
      </Panel>

      {/* Resize Handle */}
      <PanelResizeHandle className="h-1 bg-panel-border hover:bg-sonar-green transition-colors duration-200 cursor-row-resize relative group">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-sonar-green opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-panel-border rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-0.5 bg-sonar-green rounded-full" />
          </div>
        </div>
      </PanelResizeHandle>

      {/* Fish List Panel */}
      <Panel defaultSize={35} minSize={20}>
        <FishList 
          fishes={fishList} 
          onFishHover={setHoveredFishId}
          onFishUpdate={handleFishUpdate}
        />
      </Panel>
    </PanelGroup>
  );
}
