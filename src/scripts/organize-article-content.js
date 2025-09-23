const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simplified paragraph formatting function
function formatTextIntoProperParagraphs(content) {
  if (!content) return '';
  
  let formatted = content;
  
  // 1. Break at sentence boundaries (periods, exclamation, question marks) followed by capital letters
  formatted = formatted.replace(/([.!?])\s+(?=[A-Z])/g, '$1\n\n');
  
  // 2. Break before transition phrases and topic indicators
  const transitionPhrases = [
    'However', 'Additionally', 'Furthermore', 'Meanwhile', 'Moreover', 'Nevertheless', 
    'On the other hand', 'In contrast', 'Similarly', 'Therefore', 'Thus', 'Consequently', 
    'As a result', 'For example', 'In conclusion', 'Finally', 'According to',
    'When the', 'During the', 'After the', 'Before the'
  ];
  
  transitionPhrases.forEach(phrase => {
    const regex = new RegExp(`([.!?])\\s+(${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    formatted = formatted.replace(regex, '$1\n\n$2');
  });
  
  // 3. Break at historical dates and timeline indicators
  formatted = formatted.replace(/(\d{3,4}s?)\b(?=[\s,]+[A-Z])/g, '$1\n\n');
  formatted = formatted.replace(/(in\s+\d{3,4})\b(?=[\s,]+[A-Z])/gi, '$1\n\n');
  
  // 4. Clean up formatting - Fix multiple consecutive line breaks
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.trim();
  
  return formatted;
}

function processArticleContent(content) {
  if (!content) return '';
  
  let processed = content;
  
  // Apply paragraph formatting
  processed = formatTextIntoProperParagraphs(processed);
  
  return processed;
}

async function organizeArticleContent() {
  try {
    // Get articles with long content that likely need paragraph formatting
    // These are typically articles with block text issues
    const articles = await prisma.article.findMany({
      where: {
        AND: [
          {
            // Target articles with substantial content (more than 1000 characters)
            content: {
              not: ''
            }
          },
          {
            // Find articles that likely have formatting issues (very long content without many paragraph breaks)
            OR: [
              {
                // Articles with very long content (likely imported and not properly formatted)
                content: {
                  contains: ' '
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        content: true
      }
    });

    console.log(`Found ${articles.length} articles to process for paragraph formatting`);

    let processedCount = 0;
    let improvedCount = 0;

    for (const article of articles) {
      try {
        const originalContent = article.content;
        
        // Skip if content is too short to need formatting
        if (originalContent.length < 500) {
          console.log(`⏭️  Skipping "${article.title}" - content too short (${originalContent.length} chars)`);
          continue;
        }

        // Check if content already has good paragraph structure
        const paragraphCount = (originalContent.match(/\n\n/g) || []).length;
        const contentLength = originalContent.length;
        const averageParagraphLength = paragraphCount > 0 ? contentLength / paragraphCount : contentLength;

        // If average paragraph length is reasonable (less than 800 chars), skip
        if (averageParagraphLength < 800 && paragraphCount > 3) {
          console.log(`⏭️  Skipping "${article.title}" - already well-formatted (avg paragraph: ${Math.round(averageParagraphLength)} chars)`);
          continue;
        }

        console.log(`🔄 Processing: "${article.title}" (${contentLength} chars, ${paragraphCount} paragraphs)`);
        
        // Apply the paragraph formatting
        const formattedContent = processArticleContent(originalContent);
        
        // Check if the formatting made a meaningful improvement
        const newParagraphCount = (formattedContent.match(/\n\n/g) || []).length;
        const improvement = newParagraphCount - paragraphCount;
        
        if (improvement > 0 || formattedContent !== originalContent) {
          // Update the article with formatted content
          await prisma.article.update({
            where: { id: article.id },
            data: {
              content: formattedContent,
              updatedAt: new Date()
            }
          });
          
          improvedCount++;
          console.log(`✅ Improved: "${article.title}" - Added ${improvement} paragraph breaks (${paragraphCount} → ${newParagraphCount})`);
        } else {
          console.log(`📝 No changes needed: "${article.title}"`);
        }
        
        processedCount++;
        
        // Add a small delay to avoid overwhelming the database
        if (processedCount % 10 === 0) {
          console.log(`📊 Progress: ${processedCount}/${articles.length} articles processed, ${improvedCount} improved`);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`❌ Error processing article "${article.title}":`, error);
      }
    }

    console.log(`\n🎉 Content organization complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total articles processed: ${processedCount}`);
    console.log(`   - Articles improved: ${improvedCount}`);
    console.log(`   - Articles skipped: ${articles.length - processedCount}`);
    
  } catch (error) {
    console.error('❌ Content organization failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the organization script
organizeArticleContent();