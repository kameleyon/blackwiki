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

async function deleteAllArticles() {
  console.log('Deleting all existing articles...');
  
  // Delete related data first due to foreign key constraints
  await prisma.articleTalk.deleteMany({});
  await prisma.watchlist.deleteMany({});
  await prisma.collaboration.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.reviewState.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.version.deleteMany({});
  await prisma.reference.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.edit.deleteMany({});
  await prisma.article.deleteMany({});
  
  console.log('All articles and related data deleted.');
}

async function parseMedia(mediaString: string): Promise<MediaData | null> {
  if (!mediaString || mediaString === '{}' || mediaString === '') {
    return null;
  }
  
  try {
    const mediaData = JSON.parse(mediaString);
    return mediaData as MediaData;
  } catch (error) {
    console.error('Error parsing media JSON:', error);
    console.error('Media string:', mediaString.substring(0, 100) + '...');
    return null;
  }
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

async function createArticle(row: CSVRow, userId: string) {
  const slug = createSlug(row.title);
  
  // Parse media data
  const mediaData = await parseMedia(row.media || '{}');
  
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
    
    console.log(`✓ Created article: ${row.title} (with ${mediaData?.media_count?.total_images || 0} images, ${mediaData?.media_count?.total_audio || 0} audio, ${mediaData?.media_count?.total_video || 0} video)`);
    return article;
  } catch (error) {
    console.error(`✗ Error creating article "${row.title}":`, error);
  }
}

async function main() {
  try {
    // Delete all existing articles first
    await deleteAllArticles();
    
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
    
    const rows = await importCSVFile(filePath);
    console.log(`Found ${rows.length} rows to import`);
    
    let successCount = 0;
    for (const row of rows) {
      const result = await createArticle(row, adminUser.id);
      if (result) {
        successCount++;
      }
    }
    
    console.log(`\nImport completed! Successfully imported ${successCount} articles.`);
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();