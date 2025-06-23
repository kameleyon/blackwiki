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
    return null;
  }
}

async function getOrCreateUser() {
  let adminUser = await prisma.user.findFirst({
    where: { role: 'admin' }
  });
  
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'system@afrowiki.com',
        name: 'AfroWiki Import',
        role: 'admin'
      }
    });
  }
  
  return adminUser;
}

async function getAllRows(filePath: string): Promise<CSVRow[]> {
  const results: CSVRow[] = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function createArticle(row: CSVRow, userId: string, existingSlugs: Set<string>): Promise<boolean> {
  const slug = createSlug(row.title);
  
  // Skip if already exists
  if (existingSlugs.has(slug)) {
    return false;
  }
  
  // Parse media data
  const mediaData = parseMedia(row.media || '{}');
  const mainImage = mediaData?.images?.[0];
  
  // Create metadata
  const metadata = {
    source: 'afrowiki',
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
    media: mediaData
  };
  
  // Parse categories
  const categoryNames = row.categories
    .split(',')
    .map(c => c.trim())
    .filter(Boolean);
  
  if (row.auto_categories) {
    const autoCategories = row.auto_categories
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
    categoryNames.push(...autoCategories);
  }
  
  const uniqueCategories = [...new Set(categoryNames)];
  
  try {
    // Create categories
    const categories = await Promise.all(
      uniqueCategories.map(async (name) => {
        return await prisma.category.upsert({
          where: { name },
          create: { name },
          update: {}
        });
      })
    );
    
    // Create article
    const article = await prisma.article.create({
      data: {
        title: row.title,
        content: row.content,
        summary: row.summary || row.content.substring(0, 200) + '...',
        slug,
        metadata: JSON.stringify(metadata),
        authorId: userId,
        status: 'approved',
        isPublished: true,
        image: mainImage?.url,
        imageAlt: mainImage?.alt || mainImage?.caption || row.title,
        imageWidth: mainImage?.width ? parseInt(mainImage.width) : undefined,
        imageHeight: mainImage?.height ? parseInt(mainImage.height) : undefined,
        categories: {
          connect: categories.map(c => ({ id: c.id }))
        }
      }
    });
    
    // Create version
    await prisma.version.create({
      data: {
        number: 1,
        content: row.content,
        articleId: article.id
      }
    });
    
    // Add to existing slugs to avoid duplicates in same batch
    existingSlugs.add(slug);
    
    return true;
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Duplicate - already exists
      existingSlugs.add(slug);
      return false;
    }
    console.error(`Error creating "${row.title}": ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Starting complete article import...\n');
  
  const startTime = Date.now();
  
  // Get admin user
  const adminUser = await getOrCreateUser();
  
  // Get existing slugs
  console.log('Loading existing articles...');
  const existingArticles = await prisma.article.findMany({
    select: { slug: true }
  });
  const existingSlugs = new Set(existingArticles.map(a => a.slug));
  console.log(`Found ${existingSlugs.size} existing articles\n`);
  
  // Read all CSV data
  const csvFile = path.join(process.cwd(), 'docs/blackinfo2.csv');
  console.log('Reading CSV file...');
  const allRows = await getAllRows(csvFile);
  console.log(`Total rows in CSV: ${allRows.length}`);
  
  // Filter out duplicates and already imported
  const uniqueRows = new Map<string, CSVRow>();
  let duplicatesInCSV = 0;
  
  for (const row of allRows) {
    if (!row.title || row.title.trim() === '') continue;
    
    const slug = createSlug(row.title);
    if (!uniqueRows.has(slug)) {
      uniqueRows.set(slug, row);
    } else {
      duplicatesInCSV++;
    }
  }
  
  console.log(`Unique articles in CSV: ${uniqueRows.size}`);
  console.log(`Duplicates in CSV: ${duplicatesInCSV}`);
  
  // Get rows to import
  const rowsToImport: CSVRow[] = [];
  for (const [slug, row] of uniqueRows) {
    if (!existingSlugs.has(slug)) {
      rowsToImport.push(row);
    }
  }
  
  console.log(`Articles to import: ${rowsToImport.length}\n`);
  
  if (rowsToImport.length === 0) {
    console.log('All articles have been imported!');
    return;
  }
  
  // Process in batches
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < rowsToImport.length; i += batchSize) {
    const batch = rowsToImport.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(rowsToImport.length / batchSize);
    
    console.log(`Processing batch ${batchNum} of ${totalBatches} (${batch.length} articles)...`);
    
    let batchSuccess = 0;
    for (const row of batch) {
      const success = await createArticle(row, adminUser.id, existingSlugs);
      if (success) {
        batchSuccess++;
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log(`  Batch complete: ${batchSuccess} created, ${batch.length - batchSuccess} skipped`);
    
    // Progress update
    const progress = ((i + batch.length) / rowsToImport.length * 100).toFixed(1);
    console.log(`  Overall progress: ${progress}% (${successCount} imported, ${errorCount} errors)\n`);
    
    // Small delay between batches
    if (i + batchSize < rowsToImport.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Final summary
  const finalCount = await prisma.article.count();
  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n=== IMPORT COMPLETE ===');
  console.log(`Total articles in database: ${finalCount}`);
  console.log(`Articles imported in this run: ${successCount}`);
  console.log(`Errors/skipped: ${errorCount}`);
  console.log(`Time elapsed: ${elapsedTime} seconds`);
  console.log(`Average: ${(successCount / (parseFloat(elapsedTime) || 1)).toFixed(1)} articles/second`);
}

main()
  .catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });