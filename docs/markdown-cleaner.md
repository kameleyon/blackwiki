# Markdown Cleaner for AfroWiki

This document explains the Markdown Cleaner utility for AfroWiki, which helps ensure consistent formatting across all articles.

## Overview

The Markdown Cleaner utility provides tools to clean and normalize markdown content in articles. It addresses common formatting issues such as:

- Inconsistent heading levels
- Multiple asterisks for emphasis
- Improper spacing in lists and blockquotes
- Inconsistent formatting of links and images
- Excessive line breaks
- Improper hashtag formatting

## Components

The Markdown Cleaner consists of several components:

1. **Core Utility Library** (`src/lib/markdownCleaner.ts`)
   - Contains functions for cleaning and processing markdown
   - Handles conversion of markdown to HTML

2. **CLI Tool** (`src/scripts/clean-markdown.js`)
   - Command-line utility for batch processing articles
   - Can process a single article or all articles in the database

3. **API Endpoint** (`src/app/api/articles/clean-markdown/route.ts`)
   - REST API for cleaning markdown in articles
   - Requires admin or editor permissions

4. **UI Component** (`src/components/admin/CleanMarkdownButton.tsx`)
   - Button component for the admin interface
   - Allows cleaning markdown for a single article or all articles

## Usage

### In the Admin Interface

1. **Clean All Articles**
   - Go to the Articles Management page
   - Click the "Clean Markdown for All Articles" button in the top right
   - Wait for the process to complete

2. **Clean a Single Article**
   - Go to the Edit page for a specific article
   - Find the "Markdown Tools" section
   - Click the "Clean Markdown for this Article" button
   - Wait for the process to complete

### Using the CLI

The CLI tool can be used to clean markdown in articles from the command line:

```bash
# Clean all articles
node src/scripts/clean-markdown.js

# Clean a specific article
node src/scripts/clean-markdown.js <articleId>
```

### Programmatic Usage

You can use the markdown cleaner functions in your code:

```typescript
import { cleanMarkdown, processArticleContent, markdownToHtml } from '@/lib/markdownCleaner';

// Clean basic markdown
const cleanedMarkdown = cleanMarkdown(markdownContent);

// Process article content (handles specific AfroWiki patterns)
const processedContent = processArticleContent(articleContent);

// Convert markdown to HTML
const htmlContent = markdownToHtml(processedContent);
```

## How It Works

The markdown cleaner uses regular expressions to identify and fix common markdown formatting issues:

1. **Heading Normalization**
   - Ensures proper spacing after heading markers (#, ##, etc.)
   - Standardizes heading levels

2. **Emphasis Fixing**
   - Converts multiple asterisks to standard markdown (*, **, ***)
   - Ensures proper spacing around emphasis markers

3. **List Formatting**
   - Ensures proper spacing in unordered and ordered lists
   - Fixes indentation issues

4. **Link and Image Formatting**
   - Standardizes link and image syntax
   - Ensures proper spacing

5. **Special AfroWiki Patterns**
   - Handles specific patterns seen in AfroWiki articles
   - Fixes hashtags, dates, and other custom formatting

## Extending the Cleaner

To add new cleaning rules:

1. Identify the pattern you want to fix
2. Add a new regular expression replacement in the `cleanMarkdown` or `processArticleContent` function
3. Test the new rule on sample content
4. Update this documentation if necessary

## Best Practices

- Always preview the changes before saving them to the database
- Use the cleaner as part of the article review process
- Consider running the cleaner periodically to maintain consistency
- Train authors on proper markdown formatting to reduce the need for cleaning

## Troubleshooting

If you encounter issues with the markdown cleaner:

1. Check the browser console for error messages
2. Verify that the article content is valid markdown
3. Try cleaning a different article to see if the issue is specific to one article
4. Check the server logs for API errors
5. Contact the development team if the issue persists
