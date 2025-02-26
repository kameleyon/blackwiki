// Simple script to test the database and search functionality
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Testing database and search functionality...');
  
  // 1. Check if there are any articles in the database
  const articleCount = await prisma.article.count();
  console.log(`Total articles in database: ${articleCount}`);
  
  if (articleCount === 0) {
    console.log('No articles found in the database. Please add some articles first.');
    return;
  }
  
  // 2. Get a sample of articles
  const articles = await prisma.article.findMany({
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
      status: true,
    },
  });
  
  console.log('Sample articles:');
  articles.forEach(article => {
    console.log(`- ${article.title} (published: ${article.isPublished}, status: ${article.status})`);
  });
  
  // 3. Try to find articles with specific terms
  const searchTerms = ['haitian', 'revolution', 'history', 'culture'];
  
  for (const term of searchTerms) {
    const results = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: term } },
          { content: { contains: term } },
          { summary: { contains: term } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        status: true,
      },
    });
    
    console.log(`\nSearch results for "${term}":`);
    if (results.length === 0) {
      console.log('No articles found.');
    } else {
      results.forEach(article => {
        console.log(`- ${article.title} (published: ${article.isPublished}, status: ${article.status})`);
      });
    }
  }
  
  // 4. Check for articles with specific status
  const publishedArticles = await prisma.article.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
    },
  });
  
  console.log(`\nPublished articles (isPublished=true): ${publishedArticles.length}`);
  publishedArticles.forEach(article => {
    console.log(`- ${article.title} (status: ${article.status})`);
  });
  
  const approvedArticles = await prisma.article.findMany({
    where: { status: 'approved' },
    select: {
      id: true,
      title: true,
      slug: true,
      isPublished: true,
    },
  });
  
  console.log(`\nApproved articles (status='approved'): ${approvedArticles.length}`);
  approvedArticles.forEach(article => {
    console.log(`- ${article.title} (published: ${article.isPublished})`);
  });
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
