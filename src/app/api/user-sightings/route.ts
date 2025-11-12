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

    const { fishId } = await request.json();

    if (!fishId) {
      return NextResponse.json({ error: "Fish ID is required" }, { status: 400 });
    }

    // Check if already spotted
    const existing = await db
      .select()
      .from(userFishSighting)
      .where(
        and(
          eq(userFishSighting.userId, session.user.id),
          eq(userFishSighting.fishId, fishId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Fish already spotted by user" },
        { status: 409 }
      );
    }

    const now = new Date();
    const newSighting = await db
      .insert(userFishSighting)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        fishId,
        spottedAt: now,
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