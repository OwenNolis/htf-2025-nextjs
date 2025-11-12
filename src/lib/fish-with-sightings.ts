import { Fish } from "@/types/fish";

// Client-side function to fetch fish with sightings
export async function fetchFishesWithSightings(): Promise<Fish[]> {
  try {
    // Fetch fish data from our Next.js API route which will merge with sightings
    const response = await fetch("/api/fish-with-sightings");
    if (!response.ok) {
      throw new Error(`Failed to fetch fish data: ${response.statusText}`);
    }
    const fishes: Fish[] = await response.json();
    return fishes;
  } catch (error) {
    console.error("Error fetching fish data:", error);
    throw error;
  }
}