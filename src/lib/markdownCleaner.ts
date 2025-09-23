/**
 * Markdown Cleaner Utility
 * 
 * This utility cleans and normalizes markdown content to ensure consistent formatting
 * across all articles in the AfroWiki platform.
 */

import { linkableTerms, shouldLinkTerm, getCanonicalTerm, linkingRules } from '@/config/linkable-terms';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Helper function to create URL-friendly IDs from heading text
 */
function createHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
}

/**
 * Clean and normalize markdown content
 * @param content The raw markdown content to clean
 * @returns Cleaned and normalized markdown content
 */
export function cleanMarkdown(content: string): string {
  if (!content) return '';
  
  let cleaned = content;
  
  // Fix headings (ensure proper spacing)
  cleaned = cleaned.replace(/####+\s*([^#\n]+)/g, '#### $1');
  cleaned = cleaned.replace(/###\s*([^#\n]+)/g, '### $1');
  cleaned = cleaned.replace(/##\s*([^#\n]+)/g, '## $1');
  cleaned = cleaned.replace(/#\s*([^#\n]+)/g, '# $1');
  
  // Fix emphasis (convert ** to proper markdown)
  // First, handle cases with multiple asterisks (*** or more)
  cleaned = cleaned.replace(/\*{3,}([^*]+)\*{3,}/g, '***$1***');
  
  // Then handle standard bold and italic
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '**$1**'); // Bold
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '*$1*'); // Italic
  
  // Fix lists (ensure proper spacing)
  cleaned = cleaned.replace(/^\s*-\s*/gm, '- ');
  cleaned = cleaned.replace(/^\s*\d+\.\s*/gm, '$&');
  
  // Fix blockquotes (ensure proper spacing)
  cleaned = cleaned.replace(/^\s*>\s*/gm, '> ');
  
  // Fix horizontal rules
  cleaned = cleaned.replace(/^\s*[-*_]{3,}\s*$/gm, '---');
  
  // Fix links and images
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1]($2)');
  cleaned = cleaned.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '![$1]($2)');
  
  // Fix code blocks (using a workaround for the 's' flag which might not be supported)
  cleaned = cleaned.replace(/```([\s\S]*?)```/g, '```$1```');
  cleaned = cleaned.replace(/`([^`]+)`/g, '`$1`');
  
  // Fix multiple consecutive line breaks (more than 2)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Fix hashtags to be actual markdown tags
  cleaned = cleaned.replace(/(^|\s)#([a-zA-Z0-9]+)/g, '$1**#$2**');
  
  return cleaned;
}

/**
 * Process article content to render properly with markdown
 * This function is specifically designed to handle the formatting issues
 * seen in the AfroWiki articles
 * 
 * @param content The article content to process
 * @returns Properly formatted markdown content
 */
export function processArticleContent(content: string): string {
  if (!content) return '';
  
  let processed = content;
  
  // Fix the double asterisks for emphasis
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '**$1**');
  
  // Fix the section headers with multiple hash symbols and asterisks
  processed = processed.replace(/#{3,}\s*\*\*([^*]+)\*\*/g, '### $1');
  
  // Fix the hashtags at the end of the article
  processed = processed.replace(/#\*\*([^*]+)\*\*/g, '`#$1`');
  
  // Fix the date formatting
  processed = processed.replace(/\*\*(\d{1,2}\/\d{1,2}\/\d{4})\*\*/g, '*$1*');
  
  // Add some basic structure with headings for better organization
  processed = addBasicStructureToContent(processed);
  
  // Improve paragraph structure for better readability
  processed = formatTextIntoProperParagraphs(processed);
  
  // Apply general markdown cleaning
  processed = cleanMarkdown(processed);
  
  return processed;
}

/**
 * Add basic structure with headings to content that lacks them
 * @param content The content to add structure to
 * @returns Content with basic headings added
 */
export function addBasicStructureToContent(content: string): string {
  if (!content) return '';
  
  let structured = content;
  
  // If the content is about Haitian Heritage Month, add relevant headings
  if (content.toLowerCase().includes('haitian') && content.toLowerCase().includes('heritage')) {
    // Add an overview heading at the beginning
    structured = '## Overview\n\n' + structured;
    
    // Add headings for different sections based on content patterns
    if (structured.includes('Koolkat') || structured.includes('artist')) {
      structured = structured.replace(/(The Artist Known as|Koolkat)/i, '\n\n## Cultural Impact\n\n$1');
    }
    
    if (structured.includes('Florida') || structured.includes('communities')) {
      structured = structured.replace(/(South Florida|communities)/i, '\n\n## Community\n\n$1');
    }
  }
  
  // Add headings for other common patterns
  if (structured.includes('According to') || structured.includes('research') || structured.includes('study')) {
    structured = structured.replace(/(According to)/i, '\n\n## Research and Sources\n\n$1');
  }
  
  return structured;
}

/**
 * Format long text blocks into proper paragraphs with better readability
 * @param content The content to format
 * @returns Properly formatted content with paragraph breaks
 */
export function formatTextIntoProperParagraphs(content: string): string {
  if (!content) return '';
  
  let formatted = content;
  
  // 1. Break at historical dates and timeline indicators (fixed regex)
  formatted = formatted.replace(/(\d{3,4}s?)\b(?=[\s,]+[A-Z])/g, '$1\n\n');
  formatted = formatted.replace(/(in\s+\d{3,4})\b(?=[\s,]+[A-Z])/gi, '$1\n\n');
  
  // 2. Break before transition phrases and topic indicators (core set)
  const transitionPhrases = [
    'However', 'Additionally', 'Furthermore', 'Meanwhile', 'Moreover', 'Nevertheless', 
    'On the other hand', 'In contrast', 'Similarly', 'Therefore', 'Thus', 'Consequently', 
    'As a result', 'For example', 'In conclusion', 'Finally', 'According to',
    'When the', 'During the', 'After the', 'Before the', 'By the way of',
    'The word', 'Specifically', 'Years of'
  ];
  
  transitionPhrases.forEach(phrase => {
    const regex = new RegExp(`([.!?])\\s+(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    formatted = formatted.replace(regex, '$1\n\n$2');
  });
  
  // 3. Break at proper nouns that start new topics (names of people, places, events)
  formatted = formatted.replace(/([.!?])\s+(The\s+[A-Z][a-z]+\s+[A-Z][a-z]+|Christopher\s+Columbus|The\s+Spanish|The\s+French|The\s+Treaty\s+of)/g, '$1\n\n$2');
  
  // 4. Check if content still has very long paragraphs and apply fallback sentence breaking
  const testParagraphs = formatted.split(/\n\n/);
  const hasLongParagraphs = testParagraphs.some(para => para.length > 800);
  
  if (hasLongParagraphs) {
    // Apply conservative sentence boundary paragraphizer as fallback
    formatted = formatted.replace(/([.!?])\s+(?=[A-Z])/g, '$1\n\n');
  }
  
  // 5. Smart sentence grouping - prevent very short paragraphs only when safe
  const sentences = formatted.split(/\n\n/);
  const groupedSentences = [];
  
  // List of transition cues that should not be merged
  const transitionCues = /^(However|Additionally|Furthermore|Meanwhile|Moreover|Nevertheless|Therefore|Thus|Consequently|Finally|According|When|During|After|Before|By|The|In|On)/i;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (!sentence) continue;
    
    // Only merge if current is short, next exists, and next doesn't start with transition cue
    if (sentence.length < 100 && i < sentences.length - 1) {
      const nextSentence = sentences[i + 1]?.trim();
      if (nextSentence && 
          nextSentence.length < 150 && 
          !transitionCues.test(nextSentence) &&
          (sentence + ' ' + nextSentence).length < 300) {
        groupedSentences.push(sentence + ' ' + nextSentence);
        i++; // Skip the next sentence as we've combined it
        continue;
      }
    }
    
    groupedSentences.push(sentence);
  }
  
  formatted = groupedSentences.join('\n\n');
  
  // 6. Clean up formatting
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.trim();
  
  return formatted;
}

/**
 * Apply markdown formatting to HTML content
 * This function can be used to convert markdown to HTML for display
 * 
 * @param content The markdown content to convert to HTML
 * @returns HTML content with proper formatting
 */
export function markdownToHtml(content: string): string {
  // This is a placeholder for a more robust markdown-to-HTML converter
  // In a real implementation, you would use a library like marked or remark
  
  // For now, we'll just do some basic conversions
  let html = content;
  
  // First convert headings to HTML (before paragraph processing)
  html = html.replace(/^## (.*)$/gm, (match, text) => {
    const id = createHeadingId(text);
    return `<h2 id="${id}">${text}</h2>`;
  });
  
  // Convert single line breaks to spaces (but preserve heading structure)
  html = html.replace(/(?<!<\/h[1-6]>)\n(?!\n)(?!<h[1-6])/g, ' ');
  
  // Convert paragraphs (double line breaks) to HTML paragraphs
  html = html.replace(/\n\n+/g, '</p><p>');
  
  // Wrap in paragraph tags, but don't wrap headings
  const parts = html.split(/(<h[1-6][^>]*>.*?<\/h[1-6]>)/);
  html = parts.map(part => {
    if (part.match(/<h[1-6]/)) {
      return part; // Don't wrap headings
    } else if (part.trim()) {
      return `<p>${part}</p>`;
    }
    return part;
  }).join('');
  
  // Clean up empty paragraphs and malformed structures
  html = html.replace(/<p>\s*<\/p>/g, '');
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s*<h/g, '<h');
  html = html.replace(/<\/h([1-6])>\s*<\/p>/g, '</h$1>');
  
  // Convert remaining headings with IDs for table of contents navigation
  html = html.replace(/^# (.*$)/gm, (match, text) => {
    const id = createHeadingId(text);
    return `<h1 id="${id}">${text}</h1>`;
  });
  html = html.replace(/^## (.*$)/gm, (match, text) => {
    const id = createHeadingId(text);
    return `<h2 id="${id}">${text}</h2>`;
  });
  html = html.replace(/^### (.*$)/gm, (match, text) => {
    const id = createHeadingId(text);
    return `<h3 id="${id}">${text}</h3>`;
  });
  html = html.replace(/^#### (.*$)/gm, (match, text) => {
    const id = createHeadingId(text);
    return `<h4 id="${id}">${text}</h4>`;
  });
  html = html.replace(/^##### (.*$)/gm, (match, text) => {
    const id = createHeadingId(text);
    return `<h5 id="${id}">${text}</h5>`;
  });
  html = html.replace(/^###### (.*$)/gm, (match, text) => {
    const id = createHeadingId(text);
    return `<h6 id="${id}">${text}</h6>`;
  });
  
  // Convert emphasis with proper styling - only make explicitly marked text bold
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="text-white"><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert lists
  html = html.replace(/^\s*- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>');
  
  // Split content into paragraphs based on double line breaks
  const paragraphs = html.split(/\n\s*\n/);
  html = paragraphs
    .filter(p => p.trim().length > 0) // Remove empty paragraphs
    .map(p => {
      const trimmed = p.trim();
      // Skip if it's already an HTML element
      if (trimmed.startsWith('<')) {
        return trimmed;
      }
      return `<p class="text-white/80 mb-4 leading-relaxed">${trimmed}</p>`;
    })
    .join('\n');
  
  // Track linked terms to enforce first-occurrence-only rule
  const linkedTerms = new Set<string>();
  
  // Process each paragraph separately to enforce maxLinksPerParagraph
  html = html.replace(/<p[^>]*>(.*?)<\/p>/gs, (match, content) => {
    let currentParagraphLinkCount = 0;
    let processedContent = content;

    // Process each linkable term
    linkableTerms.forEach(config => {
      // Create a regex that matches the term and its aliases
      const terms = [config.term, ...(config.aliases || [])];
      const termPattern = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const regex = new RegExp(`\\b(${termPattern})\\b(?![^<>]*>)`, 'gi');

      // Replace each occurrence if it meets the rules
      processedContent = processedContent.replace(regex, (match: string) => {
        const canonicalTerm = getCanonicalTerm(match);
        const context = {
          isFirstOccurrence: !linkedTerms.has(canonicalTerm.toLowerCase()),
          isInExcludedContext: false, // We already exclude links with the negative lookahead
          currentParagraphLinkCount: currentParagraphLinkCount
        };

        if (shouldLinkTerm(canonicalTerm, context)) {
          linkedTerms.add(canonicalTerm.toLowerCase());
          currentParagraphLinkCount++;
          return `<a href="/search?q=${encodeURIComponent(canonicalTerm)}" class="text-white font-semibold hover:underline">${match}</a>`;
        }

        return match;
      });
    });

    return `<p class="text-white/80 mb-4 leading-relaxed">${processedContent}</p>`;
  });
  
  // Sanitize HTML to prevent XSS attacks using DOMPurify
  html = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'id', 'class'],
    ALLOW_DATA_ATTR: false
  });
  
  return html;
}

/**
 * Extract headings from markdown content to generate table of contents
 * @param content The markdown content to analyze
 * @returns Array of heading objects with text, level, and id
 */
export function extractTableOfContents(content: string): Array<{text: string, level: number, id: string}> {
  if (!content) return [];
  
  const headings: Array<{text: string, level: number, id: string}> = [];
  const headingRegex = /^(#{1,6})\s+(.*$)/gm;
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    
    // Create URL-friendly id from heading text
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
    
    headings.push({ text, level, id });
  }
  
  return headings;
}
