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
  
  // Fix the specific patterns seen in the Haitian Revolution article
  
  // Fix the double asterisks for emphasis
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '**$1**');
  
  // Fix the section headers with multiple hash symbols and asterisks
  processed = processed.replace(/#{3,}\s*\*\*([^*]+)\*\*/g, '### $1');
  
  // Fix the hashtags at the end of the article
  processed = processed.replace(/#\*\*([^*]+)\*\*/g, '`#$1`');
  
  // Fix the date formatting
  processed = processed.replace(/\*\*(\d{1,2}\/\d{1,2}\/\d{4})\*\*/g, '*$1*');
  
  // Improve paragraph structure for better readability
  processed = formatTextIntoProperParagraphs(processed);
  
  // Apply general markdown cleaning
  processed = cleanMarkdown(processed);
  
  return processed;
}

/**
 * Format long text blocks into proper paragraphs with better readability
 * @param content The content to format
 * @returns Properly formatted content with paragraph breaks
 */
export function formatTextIntoProperParagraphs(content: string): string {
  if (!content) return '';
  
  let formatted = content;
  
  // First, split into sentences at periods, exclamation marks, and question marks
  // followed by space and a capital letter
  const sentences = formatted.split(/([\.\!\?])\s+/);
  
  let result = '';
  let currentParagraph = '';
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const punctuation = sentences[i + 1] || '';
    
    if (!sentence) continue;
    
    const fullSentence = sentence.trim() + punctuation;
    currentParagraph += fullSentence + ' ';
    
    // Start new paragraph after 2-3 sentences or at logical breaks
    if (currentParagraph.length > 200 || 
        fullSentence.includes('However') || 
        fullSentence.includes('Additionally') || 
        fullSentence.includes('Furthermore') || 
        fullSentence.includes('Meanwhile') || 
        fullSentence.includes('On the other hand') ||
        /\d{4}/.test(fullSentence) // Years often indicate new topics
       ) {
      result += currentParagraph.trim() + '\n\n';
      currentParagraph = '';
    }
  }
  
  // Add any remaining content
  if (currentParagraph.trim()) {
    result += currentParagraph.trim();
  }
  
  // Clean up excessive line breaks
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.replace(/^\s+|\s+$/gm, '');
  
  return result;
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
  
  // Convert paragraphs (double line breaks) to HTML paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  // Convert headings with IDs for table of contents navigation
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
