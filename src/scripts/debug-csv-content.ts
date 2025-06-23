import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

async function debugCSVContent() {
  const filePath = path.join(process.cwd(), 'docs/blackinfo2.csv');
  
  console.log('Analyzing CSV content field...\n');
  
  // Read raw file first
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  const lines = rawContent.split('\n');
  console.log(`Total lines in file: ${lines.length}`);
  
  // Check first data row manually
  if (lines.length > 1) {
    const firstDataLine = lines[1];
    console.log(`\nFirst data line length: ${firstDataLine.length} characters`);
    console.log(`First 500 chars: ${firstDataLine.substring(0, 500)}...`);
  }
  
  // Parse with csv-parser
  const records: any[] = [];
  let count = 0;
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (record) => {
        if (count < 5) {
          records.push(record);
          console.log(`\n=== Row ${count + 1} ===`);
          console.log(`Title: ${record.title}`);
          console.log(`Content field length: ${record.content?.length || 0} characters`);
          console.log(`Summary field length: ${record.summary?.length || 0} characters`);
          console.log(`Content preview: ${record.content?.substring(0, 200) || 'EMPTY'}...`);
          
          // Check if content seems complete
          if (record.content && record.summary) {
            const summaryInContent = record.content.includes(record.summary.substring(0, 50));
            console.log(`Summary found in content: ${summaryInContent}`);
          }
        }
        count++;
      })
      .on('end', () => resolve(null))
      .on('error', reject);
  });
  
  // Check for the actual content column index
  const headers = lines[0].split(',');
  console.log('\n=== CSV Headers ===');
  headers.forEach((h, i) => console.log(`${i}: ${h.trim()}`));
}

debugCSVContent().catch(console.error);