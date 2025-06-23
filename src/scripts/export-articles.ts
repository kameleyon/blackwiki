import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportArticles() {
  console.log('Exporting articles...');
  
  // Get all articles with their relations
  const articles = await prisma.article.findMany({
    include: {
      categories: true,
      tags: true,
      references: true,
      edits: true,
      versions: true
    }
  });
  
  // Get all categories
  const categories = await prisma.category.findMany();
  
  // Get all tags
  const tags = await prisma.tag.findMany();
  
  // Create export object
  const exportData = {
    exportDate: new Date().toISOString(),
    counts: {
      articles: articles.length,
      categories: categories.length,
      tags: tags.length
    },
    categories,
    tags,
    articles: articles.map(article => ({
      ...article,
      categories: article.categories.map(c => c.id),
      tags: article.tags.map(t => t.id)
    }))
  };
  
  // Write to file
  const exportPath = path.join(process.cwd(), 'data', 'articles-export.json');
  fs.mkdirSync(path.dirname(exportPath), { recursive: true });
  fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
  
  console.log(`Exported ${articles.length} articles to ${exportPath}`);
  console.log('This file can be committed to git and imported in production.');
}

exportArticles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());