import { formatDistanceToNow } from "date-fns";
import { Fish } from "@/types/fish";
import { getRarityBadgeClass } from "@/utils/rarity";
import SpottedToggle from "./SpottedToggle";
import Image from "next/image";

interface FishCardProps {
  fish: Fish;
  onHover?: (fishId: string | null) => void;
  onClick?: (fish: Fish) => void;
}

export default function FishCard({ fish, onHover, onClick }: FishCardProps) {
  const handleCardClick = () => {
    onClick?.(fish);
  };

  return (
    <div
      className="border border-panel-border shadow-[--shadow-cockpit-border] rounded-lg p-3 hover:border-sonar-green transition-all duration-300 cursor-pointer group"
      onMouseEnter={() => onHover?.(fish.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="text-sm font-bold text-text-primary group-hover:text-sonar-green transition-colors mb-1">
            {fish.name}
          </div>
          <div
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${getRarityBadgeClass(
              fish.rarity
            )}`}
          >
            {fish.rarity}
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          <SpottedToggle fish={fish} size="sm" />
        </div>
      </div>
      
      {/* Fish Image */}
      <div className="mb-3">
        <div className="relative w-full h-32 rounded-md overflow-hidden bg-gray-800">
          <Image
            src={fish.image}
            alt={fish.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
      
      <div className="text-xs font-mono space-y-1">
        <div className="flex justify-between text-text-secondary">
          <span>LAT:</span>
          <span className="text-sonar-green">
            {fish.latestSighting.latitude.toFixed(6)}
          </span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>LON:</span>
          <span className="text-sonar-green">
            {fish.latestSighting.longitude.toFixed(6)}
          </span>
        </div>
        <div className="flex justify-between text-text-secondary pt-1 border-t border-panel-border">
          <span>LAST SEEN:</span>
          <span className="text-warning-amber">
            {formatDistanceToNow(new Date(fish.latestSighting.timestamp), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
