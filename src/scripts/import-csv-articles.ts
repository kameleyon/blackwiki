import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
  source: string;
  url: string;
  title: string;
  search_term: string;
  content: string;
  categories: string;
  key_dates?: string;
  sections?: string;
  infobox?: string;
  date_scraped: string;
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function importCSVFile(filePath: string) {
  const results: CSVRow[] = [];
  
  return new Promise<CSVRow[]>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function createOrUpdateArticle(row: CSVRow, userId: string) {
  const slug = createSlug(row.title);
  
  // Extract summary from content (first 200 characters)
  const summary = row.content.substring(0, 200) + '...';
  
  // Create metadata object
  const metadata = {
    source: row.source,
    originalUrl: row.url,
    searchTerm: row.search_term,
    dateScraped: row.date_scraped,
    keyDates: row.key_dates?.split(',').map(d => d.trim()).filter(Boolean),
    sections: row.sections?.split(',').map(s => s.trim()).filter(Boolean),
    infobox: row.infobox
  };
  
  // Parse categories
  const categoryNames = row.categories
    .split(',')
    .map(c => c.trim())
    .filter(Boolean);
  
  try {
    // Check if article already exists
    const existingArticle = await prisma.article.findUnique({
      where: { slug }
    });
    
    if (existingArticle) {
      console.log(`Article "${row.title}" already exists, skipping...`);
      return;
    }
    
    // Create categories if they don't exist
    const categories = await Promise.all(
      categoryNames.map(async (name) => {
        return await prisma.category.upsert({
          where: { name },
          create: { name },
          update: {}
        });
      })
    );
    
    // Create the article
    const article = await prisma.article.create({
      data: {
        title: row.title,
        content: row.content,
        summary,
        slug,
        metadata: JSON.stringify(metadata),
        authorId: userId,
        status: 'draft',
        isPublished: false,
        categories: {
          connect: categories.map(c => ({ id: c.id }))
        }
      }
    });
    
    console.log(`✓ Created article: ${row.title}`);
    return article;
  } catch (error) {
    console.error(`✗ Error creating article "${row.title}":`, error);
  }
}

async function main() {
  try {
    // Get the first admin user or create one
    let adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      // Create a system user for imports
      adminUser = await prisma.user.create({
        data: {
          email: 'system@blackwiki.com',
          name: 'System Import',
          role: 'admin'
        }
      });
      console.log('Created system import user');
    }
    
    // Import from both CSV files
    const csvFiles = [
      'docs/blackinfo.csv',
      'docs/improved_blackinfo.csv'
    ];
    
    for (const csvFile of csvFiles) {
      const filePath = path.join(process.cwd(), csvFile);
      console.log(`\nImporting from ${csvFile}...`);
      
      try {
        const rows = await importCSVFile(filePath);
        console.log(`Found ${rows.length} rows to import`);
        
        for (const row of rows) {
          await createOrUpdateArticle(row, adminUser.id);
        }
      } catch (error) {
        console.error(`Error importing ${csvFile}:`, error);
      }
    }
    
    console.log('\nImport completed!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();