import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userFishSighting } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/user-sightings - Get all user's fish sightings
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sightings = await db
      .select()
      .from(userFishSighting)
      .where(eq(userFishSighting.userId, session.user.id));

    return NextResponse.json(sightings);
  } catch (error) {
    console.error("Error fetching user fish sightings:", error);
    return NextResponse.json(
      { error: "Failed to fetch fish sightings" },
      { status: 500 }
    );
  }
}

// POST /api/user-sightings - Add a new user fish sighting
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fishId, latitude, longitude, sightingDate } = await request.json();

    console.log('Received sighting data:', { 
      fishId, 
      latitude, 
      longitude, 
      sightingDate,
      latitudeType: typeof latitude,
      longitudeType: typeof longitude,
      latitudeEmpty: latitude === '',
      longitudeEmpty: longitude === ''
    });

    if (!fishId) {
      return NextResponse.json({ error: "Fish ID is required" }, { status: 400 });
    }

    const now = new Date();
    const sightingDateParsed = sightingDate ? new Date(sightingDate) : now;

    const newSighting = await db
      .insert(userFishSighting)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        fishId,
        latitude: latitude && !isNaN(latitude) ? String(latitude) : null,
        longitude: longitude && !isNaN(longitude) ? String(longitude) : null,
        sightingDate: sightingDateParsed,
        spottedAt: sightingDateParsed, // Legacy field - use sightingDate for compatibility
        createdAt: now,
      })
      .returning();

    return NextResponse.json(newSighting[0]);
  } catch (error) {
    console.error("Error adding user fish sighting:", error);
    return NextResponse.json(
      { error: "Failed to add fish sighting" },
      { status: 500 }
    );
  }
}