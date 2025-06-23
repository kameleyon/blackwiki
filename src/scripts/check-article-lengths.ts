import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkArticleLengths() {
  // Get a sample of articles
  const articles = await prisma.article.findMany({
    take: 10,
    select: {
      title: true,
      content: true,
      summary: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  console.log('Sample of article lengths:\n');
  articles.forEach(article => {
    console.log(`Title: ${article.title}`);
    console.log(`Content length: ${article.content.length} characters`);
    console.log(`Summary length: ${article.summary.length} characters`);
    console.log(`First 200 chars of content: ${article.content.substring(0, 200)}...`);
    console.log('---\n');
  });
  
  // Get statistics
  const allArticles = await prisma.article.findMany({
    select: {
      content: true
    }
  });
  
  const lengths = allArticles.map(a => a.content.length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const minLength = Math.min(...lengths);
  const maxLength = Math.max(...lengths);
  
  console.log('=== CONTENT LENGTH STATISTICS ===');
  console.log(`Total articles: ${allArticles.length}`);
  console.log(`Average content length: ${avgLength.toFixed(0)} characters`);
  console.log(`Shortest article: ${minLength} characters`);
  console.log(`Longest article: ${maxLength} characters`);
  
  // Check if content matches summary
  const suspiciousArticles = articles.filter(a => 
    a.content.length <= a.summary.length + 10
  );
  
  if (suspiciousArticles.length > 0) {
    console.log('\n⚠️  WARNING: Found articles where content is same/shorter than summary!');
    suspiciousArticles.forEach(a => {
      console.log(`- ${a.title}: content=${a.content.length}, summary=${a.summary.length}`);
    });
  }
}

checkArticleLengths()
  .catch(console.error)
  .finally(() => prisma.$disconnect());