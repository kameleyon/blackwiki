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

async function analyzeImportIssues() {
  console.log('Analyzing import issues...\n');
  
  // Get all existing article slugs
  const existingArticles = await prisma.article.findMany({
    select: { slug: true, title: true }
  });
  const existingSlugMap = new Map(existingArticles.map(a => [a.slug, a.title]));
  
  // Read CSV and analyze
  const csvFile = 'docs/blackinfo2.csv';
  const filePath = path.join(process.cwd(), csvFile);
  
  const csvRows: CSVRow[] = [];
  const duplicateSlugs = new Map<string, string[]>(); // slug -> [titles]
  const missingFromDB: string[] = [];
  const emptyTitles: number[] = [];
  const rowNumbers = new Map<string, number>();
  
  return new Promise<void>((resolve, reject) => {
    let rowNumber = 0;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: CSVRow) => {
        rowNumber++;
        csvRows.push(data);
        
        // Check for empty titles
        if (!data.title || data.title.trim() === '') {
          emptyTitles.push(rowNumber);
          return;
        }
        
        const slug = createSlug(data.title);
        
        // Track row numbers for each slug
        if (!rowNumbers.has(slug)) {
          rowNumbers.set(slug, rowNumber);
        } else {
          // Found a duplicate slug
          if (!duplicateSlugs.has(slug)) {
            // First duplicate found
            const firstTitle = csvRows.find(r => createSlug(r.title) === slug)?.title || 'Unknown';
            duplicateSlugs.set(slug, [firstTitle]);
          }
          duplicateSlugs.get(slug)!.push(data.title);
        }
      })
      .on('end', () => {
        // Analyze results
        console.log(`Total rows in CSV: ${csvRows.length}`);
        console.log(`Total articles in database: ${existingArticles.length}`);
        console.log(`Difference: ${csvRows.length - existingArticles.length}\n`);
        
        // Count unique slugs in CSV
        const uniqueSlugsInCSV = new Set<string>();
        csvRows.forEach(row => {
          if (row.title && row.title.trim() !== '') {
            uniqueSlugsInCSV.add(createSlug(row.title));
          }
        });
        
        console.log(`Unique slugs in CSV: ${uniqueSlugsInCSV.size}`);
        console.log(`Duplicate slugs found: ${duplicateSlugs.size}`);
        console.log(`Empty titles found: ${emptyTitles.length}\n`);
        
        // Show some duplicate examples
        if (duplicateSlugs.size > 0) {
          console.log('Examples of duplicate slugs (same slug, different titles):');
          let count = 0;
          duplicateSlugs.forEach((titles, slug) => {
            if (count < 10) {
              console.log(`\nSlug: "${slug}"`);
              titles.forEach(title => console.log(`  - "${title}"`));
              count++;
            }
          });
          if (duplicateSlugs.size > 10) {
            console.log(`\n... and ${duplicateSlugs.size - 10} more duplicate slugs`);
          }
        }
        
        // Check which unique slugs from CSV are missing from DB
        let missingCount = 0;
        uniqueSlugsInCSV.forEach(slug => {
          if (!existingSlugMap.has(slug)) {
            missingCount++;
            if (missingFromDB.length < 10) {
              const title = csvRows.find(r => createSlug(r.title) === slug)?.title || 'Unknown';
              missingFromDB.push(title);
            }
          }
        });
        
        console.log(`\nUnique slugs missing from database: ${missingCount}`);
        if (missingFromDB.length > 0) {
          console.log('Examples of missing articles:');
          missingFromDB.forEach(title => console.log(`  - "${title}"`));
          if (missingCount > 10) {
            console.log(`  ... and ${missingCount - 10} more`);
          }
        }
        
        // Summary
        console.log('\n=== IMPORT ISSUES SUMMARY ===');
        console.log(`1. Duplicate slugs (would cause unique constraint error): ${duplicateSlugs.size}`);
        console.log(`2. Empty titles: ${emptyTitles.length}`);
        console.log(`3. Successfully imported unique articles: ${existingArticles.length}`);
        console.log(`4. Articles that could still be imported: ${missingCount}`);
        console.log(`5. Total issues preventing import: ${duplicateSlugs.size + emptyTitles.length}`);
        
        resolve();
      })
      .on('error', reject);
  });
}

async function main() {
  try {
    await analyzeImportIssues();
  } catch (error) {
    console.error('Analysis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();