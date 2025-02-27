import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

// Validation schema for request body
const validationRequestSchema = z.object({
  content: z.string().min(1, "Content is required"),
  title: z.string().min(1, "Title is required"),
  references: z.array(z.string()).optional().default([]),
});

// Function to calculate readability metrics
function calculateReadabilityMetrics(text: string) {
  // Remove HTML tags if present
  const cleanText = text.replace(/<[^>]*>/g, "");
  
  // Split text into words, sentences, and paragraphs
  const words = cleanText.match(/\b\w+\b/g) || [];
  const sentences = cleanText.match(/[.!?]+(?:\s|$)/g) || [];
  const paragraphs = cleanText.split(/\n\s*\n/).filter(Boolean);
  
  // Count syllables (simplified approach)
  const syllableCount = words.reduce((count, word) => {
    // Simple syllable counting heuristic
    const wordLower = word.toLowerCase();
    const syllables = wordLower.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '')
      .replace(/^y/, '')
      .match(/[aeiouy]{1,2}/g)?.length || 1;
    return count + syllables;
  }, 0);
  
  // Count complex words (words with 3+ syllables)
  const complexWords = words.filter(word => {
    const wordLower = word.toLowerCase();
    const syllables = wordLower.replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, '')
      .replace(/^y/, '')
      .match(/[aeiouy]{1,2}/g)?.length || 1;
    return syllables >= 3;
  }).length;
  
  // Count long sentences (more than 25 words)
  const longSentences = sentences.filter(sentence => {
    const sentenceWords = sentence.match(/\b\w+\b/g) || [];
    return sentenceWords.length > 25;
  }).length;
  
  // Calculate average sentence and word length
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const averageSentenceLength = wordCount / Math.max(1, sentenceCount);
  const averageWordLength = words.join("").length / Math.max(1, wordCount);
  
  // Calculate readability scores
  // Flesch-Kincaid Reading Ease
  const fleschKincaid = 206.835 - (1.015 * averageSentenceLength) - (84.6 * (syllableCount / Math.max(1, wordCount)));
  
  // Gunning Fog Index
  const gunningFog = 0.4 * (averageSentenceLength + 100 * (complexWords / Math.max(1, wordCount)));
  
  // Coleman-Liau Index
  const colemanLiau = 5.89 * (words.join("").length / Math.max(1, wordCount)) - 0.3 * (sentenceCount / (wordCount / 100)) - 15.8;
  
  // SMOG Index
  const smog = 1.043 * Math.sqrt(complexWords * (30 / Math.max(1, sentenceCount))) + 3.1291;
  
  // Automated Readability Index
  const automatedReadability = 4.71 * averageWordLength + 0.5 * averageSentenceLength - 21.43;
  
  // Average grade level
  const averageGradeLevel = (gunningFog + smog + colemanLiau + automatedReadability) / 4;
  
  return {
    fleschKincaid: Math.max(0, Math.min(100, fleschKincaid)),
    gunningFog,
    colemanLiau,
    smog,
    automatedReadability,
    averageGradeLevel,
    wordCount,
    sentenceCount,
    paragraphCount: paragraphs.length,
    averageSentenceLength,
    averageWordLength,
    longSentences,
    complexWords
  };
}

// Function to check for grammar and style issues
function checkGrammarAndStyle(text: string) {
  // In a real implementation, this would use a grammar checking API
  // For now, we'll use some simple pattern matching for demonstration
  
  const issues = [];
  
  // Check for common spelling errors
  const spellingErrors = [
    { pattern: /\b(recieve|recieved|recieving)\b/gi, suggestion: "receive", description: "The word is misspelled" },
    { pattern: /\b(accomodate|accomodating)\b/gi, suggestion: "accommodate", description: "The word is misspelled" },
    { pattern: /\b(seperate|seperating|seperation)\b/gi, suggestion: "separate", description: "The word is misspelled" },
    { pattern: /\b(definately)\b/gi, suggestion: "definitely", description: "The word is misspelled" },
    { pattern: /\b(occured|occuring)\b/gi, suggestion: "occurred", description: "The word is misspelled" },
  ];
  
  // Check for passive voice
  const passiveVoicePatterns = [
    /\b(is|are|was|were|be|been|being)\s+(\w+ed|written|made|done|created|built|sold)\b/gi
  ];
  
  // Check for wordiness
  const wordinessPatterns = [
    { pattern: /\b(due to the fact that)\b/gi, suggestion: "because", description: "This phrase could be more concise" },
    { pattern: /\b(in order to)\b/gi, suggestion: "to", description: "This phrase could be more concise" },
    { pattern: /\b(for the purpose of)\b/gi, suggestion: "for", description: "This phrase could be more concise" },
    { pattern: /\b(in the event that)\b/gi, suggestion: "if", description: "This phrase could be more concise" },
    { pattern: /\b(at this point in time)\b/gi, suggestion: "now", description: "This phrase could be more concise" },
  ];
  
  // Check for spelling errors
  for (const error of spellingErrors) {
    const matches = text.match(error.pattern);
    if (matches) {
      for (const match of matches) {
        const context = findContext(text, match);
        issues.push({
          type: "error",
          title: "Spelling error",
          description: `${error.description}: "${match}"`,
          location: context,
          suggestion: error.suggestion
        });
      }
    }
  }
  
  // Check for passive voice
  for (const pattern of passiveVoicePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const context = findContext(text, match);
        issues.push({
          type: "warning",
          title: "Passive voice",
          description: "Consider using active voice for clearer writing",
          location: context,
          suggestion: "Rewrite in active voice"
        });
      }
    }
  }
  
  // Check for wordiness
  for (const pattern of wordinessPatterns) {
    const matches = text.match(pattern.pattern);
    if (matches) {
      for (const match of matches) {
        const context = findContext(text, match);
        issues.push({
          type: "info",
          title: "Wordiness",
          description: pattern.description,
          location: context,
          suggestion: pattern.suggestion
        });
      }
    }
  }
  
  return issues;
}

// Helper function to find context around a match
function findContext(text: string, match: string) {
  const index = text.indexOf(match);
  if (index === -1) return "";
  
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + match.length + 20);
  
  return "..." + text.substring(start, end).trim() + "...";
}

// Function to validate links
async function validateLinks(links: string[]) {
  // In a real implementation, this would make HTTP requests to check links
  // For now, we'll simulate link validation
  
  return Promise.all(links.map(async (url) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Simple validation based on URL format
    const isValidUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url);
    
    if (!isValidUrl) {
      return {
        url,
        status: "invalid" as const,
        statusCode: 0,
        error: "Invalid URL format"
      };
    }
    
    // Simulate random success/failure for demonstration
    const random = Math.random();
    if (random < 0.8) {
      return {
        url,
        status: "valid" as const,
        statusCode: 200
      };
    } else {
      return {
        url,
        status: "invalid" as const,
        statusCode: 404,
        error: "Not found"
      };
    }
  }));
}

// Function to validate citations
function validateCitations(references: string[]) {
  // In a real implementation, this would use a citation validation service
  // For now, we'll use some simple pattern matching for demonstration
  
  return references.map(reference => {
    // Check if the reference follows a common citation format
    const hasAuthor = /[A-Z][a-z]+,\s+[A-Z]\./.test(reference);
    const hasYear = /\(\d{4}\)/.test(reference);
    const hasTitle = /"[^"]+"/.test(reference) || /[""][^""]+[""]/.test(reference);
    const hasPublisher = /[A-Z][a-z]+\s+Press|University|Publications/.test(reference);
    
    const issues = [];
    if (!hasAuthor) issues.push("Missing author");
    if (!hasYear) issues.push("Missing year");
    if (!hasTitle) issues.push("Missing title");
    if (!hasPublisher) issues.push("Missing publisher");
    
    const isValid = issues.length === 0 || reference.startsWith("http");
    
    let suggestion = "";
    if (!isValid) {
      if (reference.startsWith("http")) {
        suggestion = "Consider using a proper citation format for this URL";
      } else {
        suggestion = "Format as: Author, A. (Year). \"Title\". Publisher.";
      }
    }
    
    return {
      reference,
      isValid,
      issues: isValid ? undefined : issues,
      suggestion: isValid ? undefined : suggestion
    };
  });
}

// Function to check for duplicate content
function checkDuplicateContent(content: string) {
  // In a real implementation, this would use a plagiarism detection service
  // For now, we'll simulate duplicate content detection
  
  // Simulate a random originality score (higher is better)
  const score = Math.floor(Math.random() * 15); // 0-15% potential duplication
  
  // Simulate potential matches
  const matches = [];
  if (score > 5) {
    // Extract a random paragraph to simulate a "match"
    const paragraphs = content.split(/\n\s*\n/).filter(Boolean);
    if (paragraphs.length > 0) {
      const randomParagraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
      const truncatedParagraph = randomParagraph.length > 100 
        ? randomParagraph.substring(0, 100) + "..." 
        : randomParagraph;
      
      matches.push({
        text: truncatedParagraph,
        similarity: Math.floor(Math.random() * 30) + 70, // 70-99% similarity
        source: "example.com/similar-article"
      });
    }
  }
  
  return {
    score,
    matches
  };
}

// Function to assess content quality
interface ReadabilityMetrics {
  fleschKincaid: number;
  gunningFog: number;
  colemanLiau: number;
  smog: number;
  automatedReadability: number;
  averageGradeLevel: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  averageSentenceLength: number;
  averageWordLength: number;
  longSentences: number;
  complexWords: number;
}

function assessContentQuality(content: string, readabilityMetrics: ReadabilityMetrics) {
  // In a real implementation, this would use more sophisticated analysis
  // For now, we'll use some simple heuristics
  
  const strengths = [];
  const weaknesses = [];
  
  // Check for good paragraph structure
  const paragraphs = content.split(/\n\s*\n/).filter(Boolean);
  
  if (paragraphs.length >= 5) {
    strengths.push("Well-structured with multiple paragraphs");
  } else {
    weaknesses.push("Could benefit from more paragraph breaks");
  }
  
  // Check for headings
  const headingMatches = content.match(/#{1,3}\s+.+|<h[1-3][^>]*>.+<\/h[1-3]>/gi);
  if (headingMatches && headingMatches.length >= 2) {
    strengths.push("Good use of headings to organize content");
  } else {
    weaknesses.push("Consider adding headings to organize content");
  }
  
  // Check for links and references
  const linkMatches = content.match(/\[.+\]\(.+\)|<a\s+href=["'].+["']>/gi);
  if (linkMatches && linkMatches.length >= 2) {
    strengths.push("Good use of links to reference external sources");
  }
  
  // Check for lists
  const listMatches = content.match(/^\s*[-*+]\s+.+|<(ul|ol)[^>]*>[\s\S]+?<\/(ul|ol)>/gim);
  if (listMatches && listMatches.length >= 1) {
    strengths.push("Effective use of lists to present information");
  }
  
  // Check for readability
  if (readabilityMetrics.fleschKincaid >= 60) {
    strengths.push("Content is readable and accessible");
  } else {
    weaknesses.push("Content may be difficult to read for some audiences");
  }
  
  // Check for sentence variety
  if (readabilityMetrics.longSentences / Math.max(1, readabilityMetrics.sentenceCount) < 0.2) {
    strengths.push("Good variety of sentence lengths");
  } else {
    weaknesses.push("Too many long sentences may reduce readability");
  }
  
  // Generate suggestions based on weaknesses
  const suggestions = weaknesses.map(weakness => {
    switch (weakness) {
      case "Could benefit from more paragraph breaks":
        return "Break up long sections of text into smaller paragraphs";
      case "Consider adding headings to organize content":
        return "Add headings (H2, H3) to organize your content into logical sections";
      case "Content may be difficult to read for some audiences":
        return "Simplify language and use shorter sentences to improve readability";
      case "Too many long sentences may reduce readability":
        return "Break up long sentences into shorter ones for better readability";
      default:
        return weakness;
    }
  });
  
  // Calculate overall quality score
  let score = 70; // Base score
  
  // Adjust based on strengths and weaknesses
  score += strengths.length * 5;
  score -= weaknesses.length * 5;
  
  // Adjust based on readability
  score += (readabilityMetrics.fleschKincaid - 50) / 5;
  
  // Ensure score is within 0-100 range
  score = Math.max(0, Math.min(100, score));
  
  // Determine quality level
  let level: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 90) level = 'excellent';
  else if (score >= 75) level = 'good';
  else if (score >= 60) level = 'fair';
  else level = 'poor';
  
  return {
    score: Math.round(score),
    level,
    strengths,
    weaknesses,
    suggestions
  };
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = validationRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { content, references } = validationResult.data;
    
    // Calculate readability metrics
    const readabilityMetrics = calculateReadabilityMetrics(content);
    
    // Check grammar and style
    const grammarIssues = checkGrammarAndStyle(content);
    
    // Extract links from content and references
    const contentLinks = (content.match(/https?:\/\/[^\s)>"']+/g) || []);
    const referenceLinks = references.filter(ref => ref.startsWith('http'));
    const allLinks = [...new Set([...contentLinks, ...referenceLinks])];
    
    // Validate links
    const linkValidation = await validateLinks(allLinks);
    
    // Validate citations
    const citationValidation = validateCitations(references);
    
    // Check for duplicate content
    const duplicateCheck = checkDuplicateContent(content);
    
    // Assess content quality
    const contentQuality = assessContentQuality(content, readabilityMetrics);
    
    // Calculate overall score
    const readabilityScore = readabilityMetrics.fleschKincaid;
    const grammarScore = 100 - (grammarIssues.length * 5);
    const linksScore = linkValidation.filter(l => l.status === 'valid').length / Math.max(1, linkValidation.length) * 100;
    const citationsScore = citationValidation.filter(c => c.isValid).length / Math.max(1, citationValidation.length) * 100;
    const duplicateScore = 100 - duplicateCheck.score;
    const qualityScore = contentQuality.score;
    
    const overallScore = Math.round(
      (readabilityScore * 0.2) +
      (grammarScore * 0.2) +
      (linksScore * 0.1) +
      (citationsScore * 0.1) +
      (duplicateScore * 0.2) +
      (qualityScore * 0.2)
    );
    
    // Return validation results
    return NextResponse.json({
      readability: readabilityMetrics,
      grammarIssues,
      links: linkValidation,
      citations: citationValidation,
      duplicateContent: duplicateCheck,
      contentQuality,
      overallScore: Math.max(0, Math.min(100, overallScore))
    });
    
  } catch (error) {
    console.error("Error validating content:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to validate content" },
      { status: 500 }
    );
  }
}
