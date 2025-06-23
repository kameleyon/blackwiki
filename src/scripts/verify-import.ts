import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get stats
  const totalCount = await prisma.article.count();
  const publishedCount = await prisma.article.count({
    where: { isPublished: true }
  });
  const approvedCount = await prisma.article.count({
    where: { status: 'approved' }
  });
  
  console.log('Import Statistics:');
  console.log(`Total articles: ${totalCount}`);
  console.log(`Published articles: ${publishedCount}`);
  console.log(`Approved articles: ${approvedCount}`);
  
  // Check media data
  const articlesWithMedia = await prisma.article.findMany({
    where: {
      OR: [
        { image: { not: null } },
        { metadata: { contains: '"media"' } }
      ]
    },
    take: 10,
    select: {
      title: true,
      image: true,
      metadata: true
    }
  });
  
  console.log('\nArticles with media:');
  let mediaCount = 0;
  articlesWithMedia.forEach(article => {
    try {
      const metadata = JSON.parse(article.metadata || '{}');
      if (metadata.media && metadata.media.media_count) {
        const { total_images, total_audio, total_video } = metadata.media.media_count;
        if (total_images > 0 || total_audio > 0 || total_video > 0) {
          mediaCount++;
          console.log(`${article.title}: ${total_images} images, ${total_audio} audio, ${total_video} video`);
        }
      }
    } catch (e) {
      // Skip parse errors
    }
  });
  
  // Check source metadata
  const articlesWithAfrowiki = await prisma.article.findMany({
    where: {
      metadata: { contains: '"afrowiki"' }
    },
    take: 5,
    select: {
      title: true,
      metadata: true
    }
  });
  
  console.log('\nArticles with afrowiki source:');
  articlesWithAfrowiki.forEach(article => {
    try {
      const metadata = JSON.parse(article.metadata || '{}');
      console.log(`${article.title}: source = ${metadata.source}`);
    } catch (e) {
      console.log(`${article.title}: Error parsing metadata`);
    }
  });
  
  if (articlesWithAfrowiki.length === 0) {
    console.log('No articles found with afrowiki source!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());