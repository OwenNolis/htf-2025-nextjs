import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userFishSighting } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// DELETE /api/user-sightings/[fishId] - Remove a user fish sighting
export async function DELETE(
  request: NextRequest,
  { params }: { params: { fishId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fishId = params.fishId;

    await db
      .delete(userFishSighting)
      .where(
        and(
          eq(userFishSighting.userId, session.user.id),
          eq(userFishSighting.fishId, fishId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing user fish sighting:", error);
    return NextResponse.json(
      { error: "Failed to remove fish sighting" },
      { status: 500 }
    );
  }
}