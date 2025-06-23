import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get the first few articles with metadata
  const articles = await prisma.article.findMany({
    take: 5,
    select: {
      title: true,
      image: true,
      imageAlt: true,
      metadata: true
    }
  });
  
  console.log('Sample articles with media:');
  articles.forEach(article => {
    console.log(`\n${article.title}:`);
    console.log(`  Main image: ${article.image || 'None'}`);
    
    if (article.metadata) {
      try {
        const metadata = JSON.parse(article.metadata);
        if (metadata.media) {
          console.log(`  Media count: ${metadata.media.media_count?.total_images || 0} images, ${metadata.media.media_count?.total_audio || 0} audio, ${metadata.media.media_count?.total_video || 0} video`);
          console.log(`  Source: ${metadata.source}`);
        }
      } catch (e) {
        console.log('  Error parsing metadata');
      }
    }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());