import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkArticleContent() {
  try {
    // Get a few articles to check their content length
    const articles = await prisma.article.findMany({
      take: 5,
      where: {
        metadata: {
          contains: 'AfroWiki'
        }
      },
      select: {
        title: true,
        content: true,
        protectionLevel: true
      }
    });

    for (const article of articles) {
      console.log(`\n📄 Article: ${article.title}`);
      console.log(`   Content length: ${article.content.length} characters`);
      console.log(`   Protection level: ${article.protectionLevel}`);
      console.log(`   First 200 chars: ${article.content.substring(0, 200)}...`);
      console.log(`   Last 200 chars: ...${article.content.substring(article.content.length - 200)}`);
    }

    // Check total stats
    const stats = await prisma.article.aggregate({
      where: {
        metadata: {
          contains: 'AfroWiki'
        }
      },
      _avg: {
        content: true
      },
      _max: {
        content: true
      },
      _min: {
        content: true
      }
    });

    console.log('\n📊 Content Statistics:');
    console.log(`   Average content length: ${Math.round(stats._avg.content || 0)} characters`);
    console.log(`   Longest article: ${stats._max.content} characters`);
    console.log(`   Shortest article: ${stats._min.content} characters`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticleContent();