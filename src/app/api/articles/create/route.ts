import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
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

    const data = await request.json();
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
      enhanceWithAI = false
    } = data;

    // Create slug from title
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
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
    // In a production environment, this would be in a separate table
    const metadataField = `metadata:${JSON.stringify({
      keywords: metadata.keywords || [],
      description: metadata.description || cleanedSummary.substring(0, 160)
    })}`;

    // Create article
    const article = await prisma.article.create({
      data: {
        title,
        content: cleanedContent + '\n\n' + metadataField, // Store metadata in content for now
        summary: cleanedSummary,
        slug,
        image,
        imageAlt,
        authorId: user.id,
        status: "draft",
        // Create references
        references: {
          create: references
            .filter((ref: string) => ref.trim() !== '')
            .map((ref: string, index: number) => ({
              url: ref.startsWith('http') ? ref : 'https://example.com',
              title: `Reference ${index + 1}`,
              description: ref
            }))
        },
        // Connect existing categories
        categories: {
          connect: categories.map((id: string) => ({ id })),
        },
        // Create new tags if they don't exist
        tags: {
          connectOrCreate: tags.map((tag: string) => ({
            where: { name: tag.trim() },
            create: { name: tag.trim() },
          })),
        },
      },
    });

    return NextResponse.json({
      message: "Article created successfully",
      articleId: article.id,
    });
  } catch (error) {
    console.error("Article creation error:", error);
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
