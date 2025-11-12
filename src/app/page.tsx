import { getRarityOrder } from "@/utils/rarity";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FishTrackerLayout from "@/components/FishTrackerLayout";
import { db } from "@/db";
import { userFishSighting } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Fish, UserFishSighting } from "@/types/fish";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Fetch fish data from external API
  const response = await fetch("http://localhost:5555/api/fish");
  if (!response.ok) {
    throw new Error(`External API error: ${response.statusText}`);
  }
  const fishes: Fish[] = await response.json();

  // Fetch user's fish sightings from local database
  const userSightings = await db
    .select()
    .from(userFishSighting)
    .where(eq(userFishSighting.userId, session.user.id));

  // Group sightings by fishId
  const sightingsMap = new Map<string, UserFishSighting[]>();
  userSightings.forEach(sighting => {
    const fishId = sighting.fishId;
    if (!sightingsMap.has(fishId)) {
      sightingsMap.set(fishId, []);
    }
    
    // Handle both old and new schema formats
    const sightingDate = sighting.sightingDate || sighting.spottedAt;
    
    sightingsMap.get(fishId)!.push({
      id: sighting.id,
      userId: sighting.userId,
      fishId: sighting.fishId,
      latitude: sighting.latitude || undefined,
      longitude: sighting.longitude || undefined,
      sightingDate: sightingDate?.toISOString() || new Date().toISOString(),
      createdAt: sighting.createdAt.toISOString(),
    });
  });

  // Merge fish data with sighting status
  const fishesWithSightings = fishes.map(fish => {
    const fishSightings = sightingsMap.get(fish.id) || [];
    const isSpotted = fishSightings.length > 0;
    
    if (isSpotted) {
      // Sort sightings by date to get first and last
      const sortedSightings = [...fishSightings].sort((a, b) => 
        new Date(a.sightingDate).getTime() - new Date(b.sightingDate).getTime()
      );
      
      return {
        ...fish,
        isSpotted: true,
        sightingCount: fishSightings.length,
        firstSpottedAt: sortedSightings[0].sightingDate,
        lastSpottedAt: sortedSightings[sortedSightings.length - 1].sightingDate,
        userSightings: fishSightings,
      };
    } else {
      return {
        ...fish,
        isSpotted: false,
        sightingCount: 0,
      };
    }
  });

  // Sort fish by rarity (rarest first)
  const sortedFishes = [...fishesWithSightings].sort(
    (a, b) => getRarityOrder(a.rarity) - getRarityOrder(b.rarity)
  );

  return <FishTrackerLayout fishes={fishesWithSightings} sortedFishes={sortedFishes} />;
}
