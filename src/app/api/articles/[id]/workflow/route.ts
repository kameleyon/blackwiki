import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { 
      status, 
      qualityGrade, 
      protectionLevel, 
      featured, 
      isArchived 
    } = await request.json();

    // Validate the article exists
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        author: true
      }
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
    
    if (status !== undefined) {
      updateData.status = status;
      // Update isPublished based on status
      updateData.isPublished = status === "published";
    }
    
    if (qualityGrade !== undefined) updateData.qualityGrade = qualityGrade;
    if (protectionLevel !== undefined) updateData.protectionLevel = protectionLevel;
    if (featured !== undefined) updateData.featured = featured;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    // Update the article
    const updatedArticle = await prisma.article.update({
      where: { id: params.id },
      data: updateData
    });

    // Create audit log entries for each change
    const changes: string[] = [];
    if (status !== undefined && status !== article.status) {
      changes.push(`status: ${article.status} → ${status}`);
    }
    if (qualityGrade !== undefined && qualityGrade !== article.qualityGrade) {
      changes.push(`quality: ${article.qualityGrade || "none"} → ${qualityGrade}`);
    }
    if (protectionLevel !== undefined && protectionLevel !== article.protectionLevel) {
      changes.push(`protection: ${article.protectionLevel} → ${protectionLevel}`);
    }
    if (featured !== undefined && featured !== article.featured) {
      changes.push(`featured: ${article.featured} → ${featured}`);
    }
    if (isArchived !== undefined && isArchived !== article.isArchived) {
      changes.push(`archived: ${article.isArchived} → ${isArchived}`);
    }

    if (changes.length > 0) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "article_workflow_updated",
          targetType: "Article",
          targetId: article.id,
          details: JSON.stringify({
            articleTitle: article.title,
            changes,
            previousValues: {
              status: article.status,
              qualityGrade: article.qualityGrade,
              protectionLevel: article.protectionLevel,
              featured: article.featured,
              isArchived: article.isArchived
            },
            newValues: {
              status: status ?? article.status,
              qualityGrade: qualityGrade ?? article.qualityGrade,
              protectionLevel: protectionLevel ?? article.protectionLevel,
              featured: featured ?? article.featured,
              isArchived: isArchived ?? article.isArchived
            }
          })
        }
      });
    }

    return NextResponse.json({
      message: "Article workflow updated successfully",
      article: updatedArticle
    });

  } catch (error) {
    console.error("Error updating article workflow:", error);
    return NextResponse.json(
      { error: "Failed to update article workflow" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get article workflow history
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        targetType: "Article",
        targetId: params.id,
        action: {
          in: ["article_workflow_updated", "article_status_changed"]
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: "desc"
      }
    });

    // Transform logs into workflow history
    const history = auditLogs.map(log => {
      const details = log.details ? JSON.parse(log.details) : {};
      return {
        id: log.id,
        timestamp: log.timestamp,
        user: log.user,
        changes: details.changes || [],
        previousValues: details.previousValues || {},
        newValues: details.newValues || {}
      };
    });

    return NextResponse.json({ history });

  } catch (error) {
    console.error("Error fetching workflow history:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow history" },
      { status: 500 }
    );
  }
}