// Script to find all articles belonging to Jo Constant
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findJoConstantArticles() {
  try {
    // Find Jo Constant's user ID
    const user = await prisma.user.findFirst({
      where: {
        name: 'Jo Constant'
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      console.log('User Jo Constant not found');
      return;
    }

    console.log('Found user:', user);

    // Find all articles authored by Jo Constant
    const articles = await prisma.article.findMany({
      where: {
        authorId: user.id
      },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        isPublished: true,
        status: true,
        views: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${articles.length} articles for Jo Constant (ID: ${user.id}):`);
    console.log(JSON.stringify(articles, null, 2));

    // The equivalent SQL query would be:
    console.log('\nEquivalent SQL query:');
    console.log(`
      SELECT a.id, a.title, a.slug, a.created_at, a.updated_at, a.is_published, a.status, a.views, u.id as author_id, u.name as author_name
      FROM Article a
      JOIN User u ON a.author_id = u.id
      WHERE a.author_id = '${user.id}'
      ORDER BY a.created_at DESC;
    `);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findJoConstantArticles();
