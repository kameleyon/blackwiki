/**
 * Markdown Cleaner CLI Utility
 * 
 * This script can be used to clean and normalize markdown in articles.
 * It can process a single article or all articles in the database.
 * 
 * Usage:
 *   node src/scripts/clean-markdown.js [articleId]
 * 
 * If articleId is provided, only that article will be processed.
 * If no articleId is provided, all articles will be processed.
 */

import { PrismaClient } from '@prisma/client';
import { processArticleContent } from '../lib/markdownCleaner.js';

const prisma = new PrismaClient();

async function main() {
  const articleId = process.argv[2];
  
  if (articleId) {
    // Process a single article
    await processSingleArticle(articleId);
  } else {
    // Process all articles
    await processAllArticles();
  }
}

async function processSingleArticle(articleId) {
  console.log(`Processing article with ID: ${articleId}`);
  
  try {
    // Get the article
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });
    
    if (!article) {
      console.error(`Article with ID ${articleId} not found.`);
      return;
    }
    
    // Process the content
    const cleanedContent = processArticleContent(article.content);
    
    // Update the article
    await prisma.article.update({
      where: { id: articleId },
      data: { content: cleanedContent },
    });
    
    console.log(`Article "${article.title}" has been processed successfully.`);
  } catch (error) {
    console.error('Error processing article:', error);
  }
}

async function processAllArticles() {
  console.log('Processing all articles...');
  
  try {
    // Get all articles
    const articles = await prisma.article.findMany();
    
    console.log(`Found ${articles.length} articles to process.`);
    
    // Process each article
    for (const article of articles) {
      const cleanedContent = processArticleContent(article.content);
      
      // Update the article
      await prisma.article.update({
        where: { id: article.id },
        data: { content: cleanedContent },
      });
      
      console.log(`Processed article: ${article.title}`);
    }
    
    console.log('All articles have been processed successfully.');
  } catch (error) {
    console.error('Error processing articles:', error);
  }
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
