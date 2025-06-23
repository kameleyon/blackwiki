import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateArticles() {
  try {
    // Get all articles
    const articles = await prisma.article.findMany({
      where: {
        metadata: {
          contains: 'Wikipedia'
        }
      }
    });

    console.log(`Found ${articles.length} articles to update`);

    let updatedCount = 0;

    for (const article of articles) {
      try {
        // Parse the metadata
        const metadata = JSON.parse(article.metadata || '{}');
        
        // Update source from Wikipedia to AfroWiki
        if (metadata.source === 'Wikipedia') {
          metadata.source = 'AfroWiki';
        }
        
        // Update the article
        await prisma.article.update({
          where: { id: article.id },
          data: {
            metadata: JSON.stringify(metadata),
            isPublished: true,
            status: 'approved'
          }
        });
        
        updatedCount++;
        console.log(`✓ Updated: ${article.title}`);
      } catch (error) {
        console.error(`✗ Error updating article "${article.title}":`, error);
      }
    }

    console.log(`\nSuccessfully updated ${updatedCount} articles`);
    
    // Also update any remaining articles that might not have Wikipedia in metadata
    const remainingArticles = await prisma.article.updateMany({
      where: {
        isPublished: false,
        status: 'draft'
      },
      data: {
        isPublished: true,
        status: 'approved'
      }
    });
    
    console.log(`Updated ${remainingArticles.count} additional articles to published/approved status`);
    
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateArticles();