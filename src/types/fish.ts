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
}

export type Rarity = "COMMON" | "RARE" | "EPIC";
