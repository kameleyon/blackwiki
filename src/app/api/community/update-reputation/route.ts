import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { points } = await request.json();

    if (typeof points !== "number") {
      return NextResponse.json(
        { error: "Invalid points value" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user reputation
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        reviewerReputation: {
          increment: points
        }
      }
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "reputation_updated",
        targetType: "User",
        targetId: user.id,
        details: JSON.stringify({
          pointsAdded: points,
          newReputation: updatedUser.reviewerReputation,
          reason: "review_completed"
        })
      }
    });

    return NextResponse.json({
      message: "Reputation updated successfully",
      newReputation: updatedUser.reviewerReputation
    });

  } catch (error) {
    console.error("Error updating reputation:", error);
    return NextResponse.json(
      { error: "Failed to update reputation" },
      { status: 500 }
    );
  }
}