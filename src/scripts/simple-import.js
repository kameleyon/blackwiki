const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function importCSV() {
  console.log('🚀 Starting CSV import...');
  
  // First, clear existing articles to import fresh dataset
  const existingCount = await prisma.article.count();
  console.log(`📊 Found ${existingCount} existing articles`);
  
  if (existingCount > 0) {
    console.log('🗑️ Clearing existing articles for fresh import...');
    
    // Delete related data first due to foreign key constraints
    await prisma.watchlist.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.edit.deleteMany({});
    await prisma.auditLog.deleteMany({ where: { targetType: 'Article' } });
    await prisma.article.deleteMany({});
    
    console.log('✅ Existing articles cleared');
  }

  // Create a default user for imports
  let defaultUser;
  try {
    defaultUser = await prisma.user.upsert({
      where: { email: 'system@afrowiki.com' },
      update: {},
      create: {
        name: 'AfroWiki System',
        email: 'system@afrowiki.com',
        role: 'ADMIN',
        emailVerified: new Date(),
        joinedAt: new Date(),
        lastActive: new Date()
      }
    });
    console.log('👤 Created/found system user:', defaultUser.name);
  } catch (error) {
    console.error('Error creating system user:', error);
    return;
  }

  const results = [];
  let processed = 0;
  let created = 0;
  const batchSize = 50; // Process in smaller batches

  return new Promise((resolve, reject) => {
    fs.createReadStream('docs/blackinfonolimit.csv')
      .pipe(csv())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', async () => {
        console.log(`📄 Found ${results.length} rows to process`);
        
        // Process in batches
        for (let i = 0; i < results.length; i += batchSize) {
          const batch = results.slice(i, i + batchSize);
          
          for (const row of batch) {
            try {
              // Skip if no title or content
              if (!row.title || !row.content) {
                processed++;
                continue;
              }

              const slug = createSlug(row.title);
              
              // Parse categories
              const categories = row.categories
                ? row.categories.split(',').map(c => c.trim()).filter(Boolean)
                : ['General'];

              // Create article
              await prisma.article.create({
                data: {
                  title: row.title,
                  slug: slug + '-' + Date.now(), // Add timestamp to ensure uniqueness
                  summary: row.summary || row.title,
                  content: row.content || row.summary || row.title,
                  authorId: defaultUser.id,
                  isPublished: true,
                  isArchived: false,
                  status: 'published',
                  views: 0,
                  likes: 0,
                  metadata: JSON.stringify({
                    originalUrl: row.url,
                    searchTerm: row.search_term,
                    dateScraped: row.date_scraped,
                    source: 'afrowiki-import'
                  }),
                  categories: {
                    connectOrCreate: categories.slice(0, 5).map(name => ({
                      where: { name },
                      create: { name }
                    }))
                  }
                }
              });
              
              created++;
              processed++;
              
              if (created % 10 === 0) {
                console.log(`✅ Imported ${created} articles (processed ${processed})`);
              }
              
            } catch (error) {
              console.error(`❌ Error importing "${row.title}":`, error.message);
              processed++;
            }
          }
          
          // Small delay between batches
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`🎉 Import complete! Created ${created} articles out of ${processed} processed.`);
        resolve();
      })
      .on('error', reject);
  });
}

// Run import
importCSV()
  .then(() => {
    console.log('✅ Import finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });