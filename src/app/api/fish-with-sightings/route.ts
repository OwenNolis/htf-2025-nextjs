import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userFishSighting, userFishImage } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Fish, UserFishSighting, UserFishImage } from "@/types/fish";

export async function GET(request: NextRequest) {
  try {
    // Fetch fish data from external API
    const response = await fetch("http://localhost:5555/api/fish");
    if (!response.ok) {
      throw new Error(`External API error: ${response.statusText}`);
    }
    const fishes: Fish[] = await response.json();

    // Try to get user session and sightings
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session) {
        // Fetch user's fish sightings from local database
        const userSightings = await db
          .select()
          .from(userFishSighting)
          .where(eq(userFishSighting.userId, session.user.id));

        // Fetch user's fish images from local database
        const userImages = await db
          .select()
          .from(userFishImage)
          .where(eq(userFishImage.userId, session.user.id));

        // Group sightings by fishId and handle both old and new formats
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

        // Group images by fishId
        const imagesMap = new Map<string, UserFishImage[]>();
        userImages.forEach(image => {
          const fishId = image.fishId;
          if (!imagesMap.has(fishId)) {
            imagesMap.set(fishId, []);
          }
          
          imagesMap.get(fishId)!.push({
            id: image.id,
            userId: image.userId,
            fishId: image.fishId,
            imageUrl: image.imageUrl,
            caption: image.caption || undefined,
            takenAt: image.takenAt?.toISOString() || undefined,
            createdAt: image.createdAt.toISOString(),
          });
        });

        // Merge fish data with sighting status
        const fishesWithSightings = fishes.map(fish => {
          const fishSightings = sightingsMap.get(fish.id) || [];
          const fishImages = imagesMap.get(fish.id) || [];
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
              userImages: fishImages,
            };
          } else {
            return {
              ...fish,
              isSpotted: false,
              sightingCount: 0,
              userImages: fishImages,
            };
          }
        });

        return NextResponse.json(fishesWithSightings);
      }
    } catch (error) {
      // If session/auth fails, just continue without sighting data
      console.warn("Could not fetch user sightings:", error);
    }

    // Return fish without sighting data if no session
    const fishesWithoutSightings = fishes.map(fish => ({
      ...fish,
      isSpotted: false,
    }));

    return NextResponse.json(fishesWithoutSightings);
  } catch (error) {
    console.error("Error fetching fish data:", error);
    return NextResponse.json(
      { error: "Failed to fetch fish data" },
      { status: 500 }
    );
  }
}