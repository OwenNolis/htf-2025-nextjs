// Fish
export interface Fish {
  id: string;
  name: string;
  image: string;
  rarity: Rarity;
  latestSighting: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  // User sighting information (populated based on current user)
  isSpotted?: boolean;
  spottedAt?: string;
}

export type Rarity = "COMMON" | "RARE" | "EPIC";

export type FilterType = "all" | "spotted" | "unseen";

// User Fish Sighting interface
export interface UserFishSighting {
  id: string;
  userId: string;
  fishId: string;
  spottedAt: string;
  createdAt: string;
}
