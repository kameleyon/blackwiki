import OpenAI from "openai";
import { prisma } from './db';

// This integration uses OpenAI API - the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface RewriteResult {
  originalLength: number;
  newLength: number;
  expansionFactor: number;
  factualAdditions: string[];
  qualityScore: number;
  success: boolean;
  error?: string;
}

interface RewriteOptions {
  targetLength?: number;
  addSources?: boolean;
  enhanceFactualContent?: boolean;
  preserveOriginalStructure?: boolean;
  focusAreas?: string[];
}

/**
 * Advanced Article Rewriter Agent
 * Expands articles with factual data while avoiding plagiarism
 */
export class ArticleRewriterAgent {
  private static readonly DEFAULT_EXPANSION_FACTOR = 2.5; // Target 2.5x original length
  private static readonly MAX_RETRIES = 3;
  private static readonly RATE_LIMIT_DELAY = 1000; // 1 second between API calls

  /**
   * Make OpenAI request with retry logic and rate limiting
   */
  private static async makeOpenAIRequest(
    model: string,
    messages: any[],
    options: any = {}
  ): Promise<any> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model,
          messages,
          ...options
        });
        return response;
      } catch (error: any) {
        console.error(`OpenAI API attempt ${attempt}/${this.MAX_RETRIES} failed:`, error?.message);
        
        if (attempt === this.MAX_RETRIES) {
          throw new Error(`OpenAI API failed after ${this.MAX_RETRIES} attempts: ${error?.message}`);
        }
        
        // Exponential backoff: wait longer on each retry
        const delay = this.RATE_LIMIT_DELAY * Math.pow(2, attempt - 1);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Retry logic error'); // This should never be reached
  }

  /**
   * Validate expanded content before saving to database
   */
  private static validateExpandedContent(
    originalContent: string,
    expandedContent: string,
    newSummary: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if content was actually expanded
    if (expandedContent.length <= originalContent.length * 1.2) {
      errors.push(`Content not sufficiently expanded: ${expandedContent.length} vs ${originalContent.length * 1.2} minimum`);
    }
    
    // Check if summary exists and is reasonable length
    if (!newSummary || newSummary.trim().length < 50) {
      errors.push('Summary is missing or too short');
    }
    
    // Check if content is not empty or just whitespace
    if (!expandedContent || expandedContent.trim().length === 0) {
      errors.push('Expanded content is empty');
    }
    
    // Check for minimal content quality (basic sanity check)
    if (expandedContent.length > 0 && expandedContent.split(' ').length < 50) {
      errors.push('Expanded content appears to be too short or malformed');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Rewrite a single article to be longer and more comprehensive
   */
  static async rewriteArticle(
    articleId: string, 
    options: RewriteOptions = {}
  ): Promise<RewriteResult> {
    try {
      // Get the article from database
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        include: {
          categories: true,
          tags: true,
          references: true,
          author: true
        }
      });

      if (!article) {
        throw new Error(`Article with ID ${articleId} not found`);
      }

      const originalContent = article.content;
      const originalLength = originalContent.length;

      // Analyze the article to understand its focus and gaps
      const analysisResult = await this.analyzeArticleGaps(article.title, originalContent);
      
      // Generate expanded content with factual additions
      const expandedContent = await this.generateExpandedContent(
        article.title,
        originalContent,
        analysisResult,
        options
      );

      // Enhance with additional factual data and sources
      const enhancedContent = await this.enhanceWithFactualData(
        article.title,
        expandedContent,
        options
      );

      // Generate improved summary
      const newSummary = await this.generateEnhancedSummary(
        article.title,
        enhancedContent
      );

      // Validate the expanded content before saving
      const validation = this.validateExpandedContent(originalContent, enhancedContent, newSummary);
      if (!validation.isValid) {
        throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
      }

      // Calculate quality metrics
      const qualityScore = await this.assessContentQuality(enhancedContent);

      const newLength = enhancedContent.length;
      const expansionFactor = newLength / originalLength;

      // Update the article in the database
      await prisma.article.update({
        where: { id: articleId },
        data: {
          content: enhancedContent,
          summary: newSummary,
          updatedAt: new Date()
        }
      });

      // Create a new version for tracking
      const latestVersion = await prisma.version.findFirst({
        where: { articleId },
        orderBy: { number: 'desc' }
      });

      await prisma.version.create({
        data: {
          number: (latestVersion?.number || 0) + 1,
          content: enhancedContent,
          articleId: articleId
        }
      });

      return {
        originalLength,
        newLength,
        expansionFactor,
        factualAdditions: analysisResult.suggestedAdditions,
        qualityScore,
        success: true
      };

    } catch (error) {
      console.error(`Error rewriting article ${articleId}:`, error);
      return {
        originalLength: 0,
        newLength: 0,
        expansionFactor: 0,
        factualAdditions: [],
        qualityScore: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Analyze article for gaps and improvement opportunities
   */
  private static async analyzeArticleGaps(title: string, content: string) {
    const prompt = `As an expert in Black history and culture, analyze this article for gaps and opportunities to add factual content:

Title: ${title}
Content: ${content}

Please identify:
1. Missing historical context that should be included
2. Key facts, dates, and figures that could be added
3. Cultural significance that could be expanded
4. Related events or people that provide important context
5. Areas where more detailed explanation would improve understanding

Respond in JSON format with:
{
  "gaps": ["gap1", "gap2", ...],
  "suggestedAdditions": ["addition1", "addition2", ...],
  "focusAreas": ["area1", "area2", ...],
  "factualOpportunities": ["fact1", "fact2", ...]
}`;

    const response = await this.makeOpenAIRequest(
      "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      [
        {
          role: "system",
          content: "You are an expert researcher specializing in Black history, culture, and contemporary issues. Focus on accuracy, cultural sensitivity, and comprehensive coverage."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      { response_format: { type: "json_object" } }
    );

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Generate expanded content based on analysis
   */
  private static async generateExpandedContent(
    title: string,
    originalContent: string,
    analysis: any,
    options: RewriteOptions
  ): Promise<string> {
    const targetLength = options.targetLength || originalContent.length * this.DEFAULT_EXPANSION_FACTOR;
    
    const prompt = `You are a skilled writer and researcher specializing in Black history and culture. Your task is to significantly expand this article while maintaining accuracy and avoiding plagiarism.

Original Article:
Title: ${title}
Content: ${originalContent}

Analysis Results:
Gaps to address: ${JSON.stringify(analysis.gaps)}
Suggested additions: ${JSON.stringify(analysis.suggestedAdditions)}
Focus areas: ${JSON.stringify(analysis.focusAreas)}

Instructions:
1. Expand the article to approximately ${Math.round(targetLength)} characters
2. Add detailed historical context and background information
3. Include specific dates, names, and factual details
4. Expand on cultural significance and impact
5. Add connections to related events, people, and movements
6. Maintain the original structure but add substantial new sections
7. Ensure all additions are factually accurate and well-integrated
8. Write in an encyclopedic style appropriate for educational use
9. Use original phrasing and avoid copying from external sources

The expanded article should feel comprehensive and authoritative while remaining accessible to readers.`;

    const response = await this.makeOpenAIRequest(
      "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      [
        {
          role: "system",
          content: "You are an expert writer and researcher specializing in Black history, culture, and contemporary issues. Focus on creating comprehensive, accurate, and original content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      { max_completion_tokens: 4000 }
    );

    return response.choices[0].message.content || originalContent;
  }

  /**
   * Enhance content with additional factual data and potential sources
   */
  private static async enhanceWithFactualData(
    title: string,
    content: string,
    options: RewriteOptions
  ): Promise<string> {
    if (!options.enhanceFactualContent) {
      return content;
    }

    const prompt = `Enhance this article with additional factual data, statistics, and contextual information:

Title: ${title}
Content: ${content}

Add:
1. Relevant statistics and data points where appropriate
2. Historical context and timeline details
3. Cultural and social impact information
4. Connections to broader movements and themes
5. Economic, political, and social factors
6. Legacy and contemporary relevance

Ensure all additions are:
- Factually accurate and verifiable
- Seamlessly integrated into the existing content
- Written in original language
- Appropriate for an educational encyclopedia
- Culturally sensitive and respectful`;

    const response = await this.makeOpenAIRequest(
      "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      [
        {
          role: "system",
          content: "You are an expert researcher with access to comprehensive knowledge about Black history, culture, and contemporary issues. Focus on accuracy and cultural sensitivity."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      { max_completion_tokens: 4000 }
    );

    return response.choices[0].message.content || content;
  }

  /**
   * Generate an enhanced summary for the expanded article
   */
  private static async generateEnhancedSummary(title: string, content: string): Promise<string> {
    const prompt = `Create a comprehensive yet concise summary for this expanded article:

Title: ${title}
Content: ${content}

The summary should:
1. Be 200-300 words long
2. Capture the main points and key facts
3. Highlight the cultural and historical significance
4. Be engaging and informative
5. Serve as a strong introduction to the full article`;

    const response = await this.makeOpenAIRequest(
      "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      [
        {
          role: "system",
          content: "You are an expert editor specializing in creating compelling summaries for educational content about Black history and culture."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      { max_completion_tokens: 500 }
    );

    return response.choices[0].message.content || '';
  }

  /**
   * Assess the quality of the rewritten content
   */
  private static async assessContentQuality(content: string): Promise<number> {
    const prompt = `Assess the quality of this article content on a scale of 1-10:

Content: ${content}

Evaluate based on:
1. Factual accuracy and reliability
2. Comprehensiveness and depth
3. Writing quality and clarity
4. Educational value
5. Cultural sensitivity and appropriateness

Respond with just a number from 1-10.`;

    const response = await this.makeOpenAIRequest(
      "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      [
        {
          role: "system",
          content: "You are an expert content evaluator specializing in educational materials about Black history and culture."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      { max_completion_tokens: 10 }
    );

    const scoreText = response.choices[0].message.content || '5';
    const score = parseInt(scoreText.trim());
    return isNaN(score) ? 5 : Math.max(1, Math.min(10, score));
  }

  /**
   * Process multiple articles in batches with rate limiting
   */
  static async rewriteArticlesBatch(
    articleIds: string[],
    options: RewriteOptions = {},
    batchSize: number = 5
  ): Promise<RewriteResult[]> {
    const results: RewriteResult[] = [];
    
    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < articleIds.length; i += batchSize) {
      const batch = articleIds.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(articleIds.length / batchSize)}`);
      
      // Process batch with rate limiting
      const batchPromises = batch.map(async (articleId, index) => {
        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, index * this.RATE_LIMIT_DELAY));
        return this.rewriteArticle(articleId, options);
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches
      if (i + batchSize < articleIds.length) {
        console.log(`Waiting ${this.RATE_LIMIT_DELAY * 2}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_DELAY * 2));
      }
    }

    return results;
  }

  /**
   * Get articles that are candidates for rewriting (short articles, older content)
   */
  static async getCandidateArticles(limit: number = 50, includeAllStatuses: boolean = false): Promise<string[]> {
    const baseWhereCondition: any = {
      // Target shorter articles that could benefit from expansion
      content: {
        not: {
          equals: ''
        }
      }
    };

    // If not including all statuses, filter for safe articles only
    if (!includeAllStatuses) {
      baseWhereCondition.OR = [
        { status: 'published', isPublished: true },
        { status: 'approved', isPublished: true },
        { status: 'draft', isPublished: false },
        { status: 'pending_review' }
      ];
    }

    const articles = await prisma.article.findMany({
      where: baseWhereCondition,
      select: {
        id: true,
        content: true,
        updatedAt: true
      },
      orderBy: [
        // Prioritize shorter articles
        { updatedAt: 'asc' }
      ],
      take: limit
    });

    // Filter for articles with content length less than 2000 characters
    return articles
      .filter(article => article.content.length < 2000)
      .map(article => article.id);
  }
}