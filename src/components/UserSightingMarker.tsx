"use client";

import { Marker } from "react-map-gl/maplibre";
import { UserFishSighting } from "@/types/fish";
import { formatDistanceToNow } from "date-fns";

interface UserSightingMarkerProps {
  sighting: UserFishSighting;
  fishName: string;
  fishRarity: string;
  sightingNumber: number;
}

export default function UserSightingMarker({
  sighting,
  fishName,
  fishRarity,
  sightingNumber,
}: UserSightingMarkerProps) {
  // Only render if we have valid coordinates
  if (!sighting.latitude || !sighting.longitude) {
    return null;
  }

  const latitude = parseFloat(sighting.latitude);
  const longitude = parseFloat(sighting.longitude);

  // Validate coordinates
  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }

  return (
    <Marker longitude={longitude} latitude={latitude}>
      <div className="relative group cursor-pointer">
        {/* User sighting marker - different style from fish markers */}
        <div className="relative">
          {/* Pulsing ring for user sightings */}
          <div className="absolute -inset-[4px] w-3 h-3 rounded-full bg-blue-400 opacity-30 animate-ping" />
          
          {/* Main marker */}
          <div className="w-2 h-2 rounded-full bg-blue-400 border border-white shadow-lg transition-transform duration-200 group-hover:scale-150" />
          
          {/* Sighting number badge */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
            {sightingNumber}
          </div>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-navy border border-panel-border rounded text-xs whitespace-nowrap transition-opacity duration-200 opacity-0 group-hover:opacity-100 pointer-events-none z-10">
          <div className="font-bold text-blue-400">
            {fishName} - Sighting #{sightingNumber}
          </div>
          <div className="text-text-secondary text-[10px]">
            {formatDistanceToNow(new Date(sighting.sightingDate), { addSuffix: true })}
          </div>
          <div className="text-text-secondary text-[10px]">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </div>
        </div>
      </div>
    </Marker>
  );
}