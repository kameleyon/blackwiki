import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        reviews: {
          where: {
            reviewerId: session.user.id
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate statistics
    const completedReviews = user.reviews.filter(r => r.status === "completed");
    const totalScore = completedReviews.reduce((sum, review) => sum + (review.score || 0), 0);
    const averageScore = completedReviews.length > 0 ? totalScore / completedReviews.length : 0;

    // Determine badges based on achievements
    const badges = [];
    if (completedReviews.length >= 10) badges.push("Dedicated Reviewer");
    if (completedReviews.length >= 50) badges.push("Expert Reviewer");
    if (completedReviews.length >= 100) badges.push("Master Reviewer");
    if (averageScore >= 90) badges.push("Quality Champion");
    if (user.reviewerReputation >= 100) badges.push("Trusted Reviewer");
    if (user.reviewerReputation >= 500) badges.push("Senior Reviewer");

    // Determine specialties based on review types
    const reviewTypeCounts = user.reviews.reduce((acc, review) => {
      acc[review.type] = (acc[review.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const specialties = Object.entries(reviewTypeCounts)
      .filter(([_, count]) => count >= 5)
      .map(([type]) => type.charAt(0).toUpperCase() + type.slice(1) + " Review");

    const stats = {
      totalReviews: user.reviews.length,
      completedReviews: completedReviews.length,
      averageScore,
      reputation: user.reviewerReputation,
      badges,
      specialties
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching reviewer stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviewer statistics" },
      { status: 500 }
    );
  }
}