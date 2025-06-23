import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const prisma = new PrismaClient();

interface MediaItem {
  url: string;
  alt?: string;
  caption?: string;
  type?: string;
  width?: string;
  height?: string;
  format?: string;
  description?: string;
}

interface MediaData {
  images: MediaItem[];
  audio: MediaItem[];
  video: MediaItem[];
  media_count: {
    total_images: number;
    total_audio: number;
    total_video: number;
  };
}

interface CSVRow {
  source: string;
  url: string;
  title: string;
  search_term: string;
  summary: string;
  content: string;
  categories: string;
  key_dates?: string;
  sections?: string;
  infobox?: string;
  relevance_score?: string;
  entities?: string;
  themes?: string;
  auto_categories?: string;
  media?: string;
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

async function parseMedia(mediaString: string): MediaData | null {
  if (!mediaString || mediaString === '{}' || mediaString === '') {
    return null;
  }
  
  try {
    const mediaData = JSON.parse(mediaString);
    return mediaData as MediaData;
  } catch (error) {
    console.error('Error parsing media JSON:', error);
    return null;
  }
}

async function getExistingArticles(): Promise<Set<string>> {
  const articles = await prisma.article.findMany({
    select: { slug: true }
  });
  return new Set(articles.map(a => a.slug));
}

async function importCSVFile(filePath: string, existingSlugs: Set<string>) {
  const results: CSVRow[] = [];
  let skippedCount = 0;
  
  return new Promise<{ rows: CSVRow[], skipped: number }>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const slug = createSlug(data.title);
        if (!existingSlugs.has(slug)) {
          results.push(data);
        } else {
          skippedCount++;
        }
      })
      .on('end', () => resolve({ rows: results, skipped: skippedCount }))
      .on('error', reject);
  });
}

async function createArticle(row: CSVRow, userId: string): Promise<boolean> {
  const slug = createSlug(row.title);
  
  // Parse media data
  const mediaData = parseMedia(row.media || '{}');
  
  // Get the first image for the article's main image
  const mainImage = mediaData?.images?.[0];
  
  // Create metadata object with afrowiki as source
  const metadata = {
    source: 'afrowiki', // Changed from row.source to 'afrowiki'
    originalUrl: row.url,
    searchTerm: row.search_term,
    dateScraped: row.date_scraped,
    keyDates: row.key_dates?.split(',').map(d => d.trim()).filter(Boolean),
    sections: row.sections?.split(',').map(s => s.trim()).filter(Boolean),
    infobox: row.infobox,
    relevanceScore: row.relevance_score,
    entities: row.entities,
    themes: row.themes?.split(',').map(t => t.trim()).filter(Boolean),
    autoCategories: row.auto_categories?.split(',').map(c => c.trim()).filter(Boolean),
    media: mediaData // Store the full media object
  };
  
  // Parse categories
  const categoryNames = row.categories
    .split(',')
    .map(c => c.trim())
    .filter(Boolean);
  
  // Also include auto_categories if available
  if (row.auto_categories) {
    const autoCategories = row.auto_categories
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    categoryNames.push(...autoCategories);
  }
  
  // Remove duplicates
  const uniqueCategories = [...new Set(categoryNames)];
  
  try {
    // Create categories if they don't exist
    const categories = await Promise.all(
      uniqueCategories.map(async (name) => {
        return await prisma.category.upsert({
          where: { name },
          create: { name },
          update: {}
        });
      })
    );
    
    // Create the article with approved status and published
    const article = await prisma.article.create({
      data: {
        title: row.title,
        content: row.content,
        summary: row.summary || row.content.substring(0, 200) + '...',
        slug,
        metadata: JSON.stringify(metadata),
        authorId: userId,
        status: 'approved', // Set to approved
        isPublished: true, // Set to published
        image: mainImage?.url,
        imageAlt: mainImage?.alt || mainImage?.caption || row.title,
        imageWidth: mainImage?.width ? parseInt(mainImage.width) : undefined,
        imageHeight: mainImage?.height ? parseInt(mainImage.height) : undefined,
        categories: {
          connect: categories.map(c => ({ id: c.id }))
        }
      }
    });
    
    // Create version 1 for the article
    await prisma.version.create({
      data: {
        number: 1,
        content: row.content,
        articleId: article.id
      }
    });
    
    const mediaInfo = mediaData?.media_count 
      ? `(${mediaData.media_count.total_images} images, ${mediaData.media_count.total_audio} audio, ${mediaData.media_count.total_video} video)` 
      : '(no media)';
    console.log(`✓ Created article: ${row.title} ${mediaInfo}`);
    return true;
  } catch (error) {
    console.error(`✗ Error creating article "${row.title}":`, error.message);
    return false;
  }
}

async function main() {
  try {
    // Get existing article slugs
    console.log('Checking existing articles...');
    const existingSlugs = await getExistingArticles();
    console.log(`Found ${existingSlugs.size} existing articles`);
    
    // Get the first admin user or create one
    let adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      // Create a system user for imports
      adminUser = await prisma.user.create({
        data: {
          email: 'system@afrowiki.com',
          name: 'AfroWiki Import',
          role: 'admin'
        }
      });
      console.log('Created AfroWiki import user');
    }
    
    // Import from blackinfo2.csv
    const csvFile = 'docs/blackinfo2.csv';
    const filePath = path.join(process.cwd(), csvFile);
    console.log(`\nImporting from ${csvFile}...`);
    
    const { rows, skipped } = await importCSVFile(filePath, existingSlugs);
    console.log(`Found ${rows.length} new rows to import (skipped ${skipped} existing)`);
    
    // Process in batches to avoid timeout
    const batchSize = 100;
    let successCount = 0;
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(rows.length/batchSize)}...`);
      
      for (const row of batch) {
        const success = await createArticle(row, adminUser.id);
        if (success) successCount++;
      }
      
      // Add a small delay between batches
      if (i + batchSize < rows.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const finalCount = await prisma.article.count();
    console.log(`\nImport completed! Successfully imported ${successCount} new articles.`);
    console.log(`Total articles in database: ${finalCount}`);
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();