import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userFishImage } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/user-fish-images - Get all user's fish images or images for a specific fish
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fishId = searchParams.get("fishId");

    let images;
    if (fishId) {
      // Get images for specific fish
      images = await db
        .select()
        .from(userFishImage)
        .where(and(
          eq(userFishImage.userId, session.user.id),
          eq(userFishImage.fishId, fishId)
        ))
        .orderBy(userFishImage.createdAt);
    } else {
      // Get all user's images
      images = await db
        .select()
        .from(userFishImage)
        .where(eq(userFishImage.userId, session.user.id))
        .orderBy(userFishImage.createdAt);
    }

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching user fish images:", error);
    return NextResponse.json(
      { error: "Failed to fetch fish images" },
      { status: 500 }
    );
  }
}

// POST /api/user-fish-images - Add a new user fish image
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fishId, imageUrl, caption, takenAt } = await request.json();

    console.log('Received image data:', { fishId, imageUrl, caption, takenAt });

    if (!fishId || !imageUrl) {
      return NextResponse.json({ error: "Fish ID and image URL are required" }, { status: 400 });
    }

    const now = new Date();
    const takenAtParsed = takenAt ? new Date(takenAt) : null;

    const newImage = await db
      .insert(userFishImage)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        fishId,
        imageUrl,
        caption: caption || null,
        takenAt: takenAtParsed,
        createdAt: now,
      })
      .returning();

    return NextResponse.json(newImage[0]);
  } catch (error) {
    console.error("Error adding user fish image:", error);
    return NextResponse.json(
      { error: "Failed to add fish image" },
      { status: 500 }
    );
  }
}

// DELETE /api/user-fish-images - Delete a user fish image
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    // Delete the image (only if it belongs to the user)
    const deletedImage = await db
      .delete(userFishImage)
      .where(and(
        eq(userFishImage.id, imageId),
        eq(userFishImage.userId, session.user.id)
      ))
      .returning();

    if (deletedImage.length === 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user fish image:", error);
    return NextResponse.json(
      { error: "Failed to delete fish image" },
      { status: 500 }
    );
  }
}