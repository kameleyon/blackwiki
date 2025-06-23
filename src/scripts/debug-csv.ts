import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

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

async function debugCSV() {
  const results: CSVRow[] = [];
  const filePath = path.join(process.cwd(), 'docs/blackinfo2.csv');
  
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
        if (results.length === 3) {
          // Check first 3 rows
          results.forEach((row, index) => {
            console.log(`\nRow ${index + 1} - ${row.title}:`);
            console.log('Media field:', row.media ? row.media.substring(0, 200) + '...' : 'No media');
            
            // Try to parse media
            if (row.media) {
              try {
                const mediaData = JSON.parse(row.media);
                console.log('Parsed successfully!');
                console.log('Images:', mediaData.images?.length || 0);
                console.log('Audio:', mediaData.audio?.length || 0);
                console.log('Video:', mediaData.video?.length || 0);
              } catch (e) {
                console.log('Parse error:', e.message);
              }
            }
          });
          resolve();
        }
      })
      .on('end', () => resolve())
      .on('error', reject);
  });
}

debugCSV();