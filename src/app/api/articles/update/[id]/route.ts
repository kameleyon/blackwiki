import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import slugify from "slugify";
import { processArticleContent } from "@/lib/markdownCleaner";

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Update an existing article without relying on Next's
 * RouteContext param type in the handler signature.
 * We parse the article ID directly from the request URL to avoid
 * the conflicting Next.js type definition for dynamic routes.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract article ID from URL path
    const url = new URL(request.url);
    // Typically the dynamic param "[id]" is the last segment
    const segments = url.pathname.split("/");
    const articleId = segments[segments.length - 1];

    const [session, data] = await Promise.all([
      getServerSession(),
      request.json(),
    ]);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const { 
      title, 
      content, 
      summary, 
      categories, 
      tags, 
      image, 
      imageAlt,
      references = [],
      metadata = {},
      enhanceWithAI = false,
      editSummary = ""
    } = data;

    // Verify article ownership
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
        authorId: user.id,
      },
      include: {
        references: true
      }
    });

    if (!article) {
      return new NextResponse("Article not found", { status: 404 });
    }

    // Create slug from title if it changed
    let slug = article.slug;
    if (title !== article.title) {
      const baseSlug = slugify(title, { lower: true, strict: true });
      slug = baseSlug;
      let counter = 1;

      // Ensure unique slug
      while (
        await prisma.article.findFirst({
          where: {
            slug,
            id: { not: articleId }, // Exclude current article
          },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Process content based on user preferences
    let processedContent = content;
    let processedSummary = summary;

    // Enhance with AI if requested
    if (enhanceWithAI) {
      try {
        processedContent = await enhanceContentWithAI(content);
        processedSummary = await enhanceSummaryWithAI(summary);
      } catch (error) {
        console.error("AI enhancement error:", error);
        // Continue with original content if AI enhancement fails
      }
    }

    // Clean and process the content before saving
    const cleanedContent = processArticleContent(processedContent);
    const cleanedSummary = processArticleContent(processedSummary);

    // Prepare metadata for storage - store as a field on the article for now
    const metadataField = `metadata:${JSON.stringify({
      keywords: metadata.keywords || [],
      description: metadata.description || cleanedSummary.substring(0, 160)
    })}`;

    // Extract existing content without metadata
    let contentWithoutMetadata = cleanedContent;
    if (cleanedContent.includes('metadata:')) {
      contentWithoutMetadata = cleanedContent.split('metadata:')[0].trim();
    }

    // Update article
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        content: contentWithoutMetadata + '\n\n' + metadataField,
        summary: cleanedSummary,
        slug,
        image,
        imageAlt,
        updatedAt: new Date(),
        // Update references - delete existing and create new ones
        references: {
          deleteMany: {}, // Delete all existing references
          create: references
            .filter((ref: string) => ref.trim() !== '')
            .map((ref: string) => {
              // If it's a URL, use it as the URL and a shortened version as the title
              if (ref.startsWith('http')) {
                return {
                  url: ref,
                  title: ref.substring(0, 50) + (ref.length > 50 ? '...' : ''),
                  description: ref
                };
              } 
              // Otherwise, use the reference text as the title and description
              return {
                url: 'https://example.com', // Default URL
                title: ref, // Use the full reference text as the title
                description: ref
              };
            })
        },
        // Update categories
        categories: {
          set: [], // Clear existing
          connect: categories.map((id: string) => ({ id })),
        },
        // Update tags
        tags: {
          set: [], // Clear existing
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag.trim() },
            create: { name: tag.trim() },
          })),
        },
      },
    });

    // Calculate change size (character difference)
    const oldContentLength = article.content.length;
    const newContentLength = contentWithoutMetadata.length;
    const changeSize = newContentLength - oldContentLength;

    // Create edit record for tracking
    await prisma.edit.create({
      data: {
        content: contentWithoutMetadata,
        summary: editSummary,
        type: "content",
        changeSize,
        metadata: JSON.stringify({
          titleChanged: title !== article.title,
          imageChanged: image !== article.image,
          categoriesChanged: true, // We could make this more precise
          tagsChanged: true, // We could make this more precise
          editSummary,
          wordCountDiff: Math.round(changeSize / 5) // Rough estimate: 5 chars per word
        }),
        articleId: articleId,
        userId: user.id
      }
    });

    // Create audit log for change tracking
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "article_updated",
        targetType: "Article",
        targetId: articleId,
        details: JSON.stringify({
          articleTitle: title,
          editSummary,
          changeSize,
          changeType: changeSize > 100 ? "major" : changeSize > 0 ? "minor" : "formatting",
          wordCountDiff: Math.round(changeSize / 5),
          titleChanged: title !== article.title,
          imageChanged: image !== article.image,
          previousTitle: article.title,
          newTitle: title
        })
      }
    });

    return NextResponse.json({
      message: "Article updated successfully",
      articleId: updatedArticle.id,
    });
  } catch (error) {
    console.error("Article update error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Function to enhance content with AI
async function enhanceContentWithAI(content: string): Promise<string> {
  const prompt = `Please enhance the following article content. Improve grammar, formatting, and readability while preserving the original meaning and information. Format the response using markdown.

Content:
${content}

Enhanced version:`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://AfroWiki.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'perplexity/llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: "system",
          content: "You are a skilled editor specializing in Black history, culture, and contemporary issues. Your role is to enhance articles while preserving their original meaning and information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json() as OpenRouterResponse;
  return data.choices[0].message.content;
}

// Function to enhance summary with AI
async function enhanceSummaryWithAI(summary: string): Promise<string> {
  const prompt = `Please enhance the following article summary. Make it concise, engaging, and informative while preserving the original meaning.

Summary:
${summary}

Enhanced version:`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://AfroWiki.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'perplexity/llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: "system",
          content: "You are a skilled editor specializing in Black history, culture, and contemporary issues. Your role is to enhance article summaries while preserving their original meaning."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json() as OpenRouterResponse;
  return data.choices[0].message.content;
}
