import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userFishSighting } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Fish } from "@/types/fish";

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

        // Create a map for quick lookup
        const sightingsMap = new Map(
          userSightings.map(s => [s.fishId, s])
        );

        // Merge fish data with sighting status
        const fishesWithSightings = fishes.map(fish => ({
          ...fish,
          isSpotted: sightingsMap.has(fish.id),
          spottedAt: sightingsMap.get(fish.id)?.spottedAt?.toISOString(),
        }));

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