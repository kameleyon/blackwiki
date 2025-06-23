import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeContentQuality() {
  // Get sample articles
  const articles = await prisma.article.findMany({
    take: 5,
    select: {
      title: true,
      content: true,
      summary: true,
      metadata: true
    }
  });
  
  console.log('=== CONTENT ANALYSIS ===\n');
  
  for (const article of articles) {
    console.log(`Title: ${article.title}`);
    console.log(`Content length: ${article.content.length} chars`);
    
    // Check if content ends abruptly
    const lastSentence = article.content.trim().split('.').slice(-2, -1)[0];
    console.log(`Last sentence: "${lastSentence?.trim()}"`);
    
    // Check for ellipsis indicating truncation
    const hasEllipsis = article.content.includes('...');
    console.log(`Contains ellipsis: ${hasEllipsis}`);
    
    // Parse metadata to check source URL
    try {
      const metadata = JSON.parse(article.metadata || '{}');
      console.log(`Source URL: ${metadata.originalUrl}`);
    } catch (e) {
      console.log('Could not parse metadata');
    }
    
    // Check content structure
    const paragraphs = article.content.split('\n').filter(p => p.trim().length > 0);
    console.log(`Number of paragraphs: ${paragraphs.length}`);
    
    // Check if content matches summary pattern
    const summaryStart = article.summary.substring(0, 100);
    const contentStart = article.content.substring(0, 100);
    console.log(`Summary matches content start: ${summaryStart === contentStart}`);
    
    console.log('---\n');
  }
  
  // Look for patterns
  const allArticles = await prisma.article.findMany({
    select: { content: true }
  });
  
  let ellipsisCount = 0;
  let shortArticles = 0;
  let veryShortArticles = 0;
  
  allArticles.forEach(a => {
    if (a.content.includes('...')) ellipsisCount++;
    if (a.content.length < 1000) veryShortArticles++;
    if (a.content.length < 2000) shortArticles++;
  });
  
  console.log('=== STATISTICS ===');
  console.log(`Total articles: ${allArticles.length}`);
  console.log(`Articles with ellipsis (...): ${ellipsisCount} (${(ellipsisCount/allArticles.length*100).toFixed(1)}%)`);
  console.log(`Articles under 1000 chars: ${veryShortArticles} (${(veryShortArticles/allArticles.length*100).toFixed(1)}%)`);
  console.log(`Articles under 2000 chars: ${shortArticles} (${(shortArticles/allArticles.length*100).toFixed(1)}%)`);
}

analyzeContentQuality()
  .catch(console.error)
  .finally(() => prisma.$disconnect());