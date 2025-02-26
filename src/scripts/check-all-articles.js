// Script to check all articles in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllArticles() {
  try {
    // Get all articles with their authors
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        authorId: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${articles.length} articles in the database:`);
    
    // Group articles by author
    const articlesByAuthor = {};
    
    for (const article of articles) {
      const authorName = article.author?.name || 'Unknown';
      const authorId = article.authorId || 'Unknown';
      
      if (!articlesByAuthor[authorId]) {
        articlesByAuthor[authorId] = {
          name: authorName,
          articles: []
        };
      }
      
      articlesByAuthor[authorId].articles.push({
        id: article.id,
        title: article.title,
        slug: article.slug
      });
    }
    
    // Print articles by author
    console.log('\nArticles by author:');
    for (const authorId in articlesByAuthor) {
      const author = articlesByAuthor[authorId];
      console.log(`\nAuthor: ${author.name} (ID: ${authorId})`);
      console.log('Articles:');
      author.articles.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title} (ID: ${article.id})`);
      });
    }

    // Find the article titled "The Haitian Revolution: The First Successful Slave Revolt and Birth of Haiti"
    const haitianRevolutionArticle = articles.find(article => 
      article.title.includes('Haitian Revolution')
    );

    if (haitianRevolutionArticle) {
      console.log('\nFound "The Haitian Revolution" article:');
      console.log(JSON.stringify(haitianRevolutionArticle, null, 2));
    } else {
      console.log('\nCould not find "The Haitian Revolution" article');
    }

    // The equivalent SQL query would be:
    console.log('\nEquivalent SQL query:');
    console.log(`
      SELECT a.id, a.title, a.slug, a.author_id, u.id as user_id, u.name as user_name, u.email as user_email
      FROM Article a
      LEFT JOIN User u ON a.author_id = u.id
      ORDER BY a.created_at DESC;
    `);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllArticles();
