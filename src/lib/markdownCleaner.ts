/**
 * Markdown Cleaner Utility
 * 
 * This utility cleans and normalizes markdown content to ensure consistent formatting
 * across all articles in the AfroWiki platform.
 */

import { linkableTerms, shouldLinkTerm, getCanonicalTerm } from '@/config/linkable-terms';
// Note: linkingRules is imported but not used directly in this file

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
  
  // Apply general markdown cleaning
  processed = cleanMarkdown(processed);
  
  return processed;
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
  
  // Convert headings
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  
  // Convert emphasis with proper styling - only make explicitly marked text bold
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="text-white"><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert lists
  html = html.replace(/^\s*- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>');
  
  // Convert paragraphs with proper styling
  html = html.replace(/^(?!<[a-z])(.*$)/gm, '<p class="text-white/80">$1</p>');
  
  // Convert line breaks
  html = html.replace(/\n/g, '');
  
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

    return `<p class="text-white/80">${processedContent}</p>`;
  });
  
  return html;
}
