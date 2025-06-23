import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.article.count();
  console.log('Total articles:', count);
  
  const publishedCount = await prisma.article.count({
    where: { isPublished: true }
  });
  console.log('Published articles:', publishedCount);
  
  const approvedCount = await prisma.article.count({
    where: { status: 'approved' }
  });
  console.log('Approved articles:', approvedCount);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());