import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if review exists and is unassigned
    const review = await prisma.review.findUnique({
      where: { id: params.reviewId },
      include: {
        article: true
      }
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.assigneeId) {
      return NextResponse.json(
        { error: "Review is already assigned" },
        { status: 400 }
      );
    }

    // Check reviewer qualifications based on reputation
    const minReputation = {
      technical: 50,
      editorial: 30,
      cultural: 40,
      factual: 35,
      final: 100
    };

    const requiredRep = minReputation[review.type as keyof typeof minReputation] || 0;
    
    if (user.reviewerReputation < requiredRep) {
      return NextResponse.json(
        { 
          error: `Insufficient reputation. ${review.type} reviews require ${requiredRep} reputation points.`,
          currentReputation: user.reviewerReputation,
          requiredReputation: requiredRep
        },
        { status: 403 }
      );
    }

    // Assign the review
    const updatedReview = await prisma.review.update({
      where: { id: params.reviewId },
      data: {
        assigneeId: user.id,
        status: "in_progress",
        updatedAt: new Date()
      }
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "review_self_assigned",
        targetType: "Review",
        targetId: review.id,
        details: JSON.stringify({
          reviewType: review.type,
          articleId: review.articleId,
          articleTitle: review.article.title
        })
      }
    });

    // Send notification to article author (if implemented)
    // This would be done through a notification service

    return NextResponse.json({
      message: "Review assigned successfully",
      review: updatedReview
    });

  } catch (error) {
    console.error("Error assigning review:", error);
    return NextResponse.json(
      { error: "Failed to assign review" },
      { status: 500 }
    );
  }
}