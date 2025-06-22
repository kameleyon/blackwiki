import { prisma } from '../lib/db';

// This script demonstrates the proper way to import Wikipedia content
// using their official APIs while respecting their terms of service

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/w/api.php';

// Categories related to Black history and culture on Wikipedia
const RELEVANT_CATEGORIES = [
  'Category:African_diaspora',
  'Category:African-American_history',
  'Category:Black_culture',
  'Category:African_history',
  'Category:Caribbean_history',
  'Category:African-American_culture',
  'Category:Black_nationalism',
  'Category:Pan-Africanism',
  'Category:African-American_civil_rights',
  'Category:Historically_black_colleges_and_universities',
  'Category:African-American_literature',
  'Category:African-American_music',
  'Category:African-American_art',
  'Category:African-American_scientists',
  'Category:African-American_inventors'
];

// Function to search Wikipedia for articles in specific categories
async function searchWikipediaCategory(category: string) {
  const params = new URLSearchParams({
    action: 'query',
    list: 'categorymembers',
    cmtitle: category,
    cmlimit: '50', // Limit to 50 articles per request
    format: 'json',
    origin: '*'
  });

  try {
    const response = await fetch(`${WIKIPEDIA_API_BASE}?${params}`);
    const data = await response.json();
    return data.query.categorymembers;
  } catch (error) {
    console.error(`Error fetching category ${category}:`, error);
    return [];
  }
}

// Function to get article content using Wikipedia API
async function getArticleContent(title: string) {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'extracts|pageimages|categories',
    titles: title,
    exintro: 'true',
    explaintext: 'true',
    piprop: 'original',
    format: 'json',
    origin: '*'
  });

  try {
    const response = await fetch(`${WIKIPEDIA_API_BASE}?${params}`);
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    return pages[pageId];
  } catch (error) {
    console.error(`Error fetching article ${title}:`, error);
    return null;
  }
}

// Function to import article to database
async function importArticleToDatabase(wikipediaArticle: any) {
  try {
    // Check if article already exists
    const existingArticle = await prisma.article.findFirst({
      where: {
        title: wikipediaArticle.title
      }
    });

    if (existingArticle) {
      console.log(`Article "${wikipediaArticle.title}" already exists, skipping...`);
      return;
    }

    // Create article in database
    const article = await prisma.article.create({
      data: {
        title: wikipediaArticle.title,
        content: wikipediaArticle.extract || 'Content needs to be expanded.',
        summary: wikipediaArticle.extract ? 
          wikipediaArticle.extract.substring(0, 200) + '...' : 
          'Summary not available.',
        slug: wikipediaArticle.title.toLowerCase().replace(/\s+/g, '-'),
        authorId: 'system', // You'll need to create a system user
        status: 'draft',
        metadata: JSON.stringify({
          source: 'Wikipedia',
          wikipediaPageId: wikipediaArticle.pageid,
          importDate: new Date().toISOString()
        })
      }
    });

    console.log(`Imported article: ${article.title}`);
  } catch (error) {
    console.error(`Error importing article "${wikipediaArticle.title}":`, error);
  }
}

// Main import function
async function importWikipediaArticles() {
  console.log('Starting Wikipedia article import...');
  console.log('Note: This uses Wikipedia\'s official API and respects their rate limits.');
  
  for (const category of RELEVANT_CATEGORIES) {
    console.log(`\nFetching articles from ${category}...`);
    const articles = await searchWikipediaCategory(category);
    
    for (const article of articles) {
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Fetching content for: ${article.title}`);
      const fullArticle = await getArticleContent(article.title);
      
      if (fullArticle && !fullArticle.missing) {
        await importArticleToDatabase(fullArticle);
      }
    }
  }
  
  console.log('\nImport completed!');
}

// Instructions for proper usage
console.log(`
IMPORTANT: Wikipedia Content Usage Guidelines

1. This script uses Wikipedia's official API, which is the proper way to access their content.
2. Wikipedia content is available under CC BY-SA 3.0 license.
3. You must provide attribution when using Wikipedia content.
4. Respect rate limits (this script includes delays).
5. For large-scale imports, consider using Wikipedia database dumps instead.

To run this script:
1. Create a system user in your database first
2. Update the authorId in the script
3. Run: npx ts-node src/scripts/wikipedia-import.ts

For production use, consider:
- Implementing proper attribution display
- Adding a review process for imported content
- Allowing users to improve and expand the imported content
- Regular updates from Wikipedia for changed content
`);

// Export for use in other scripts
export { importWikipediaArticles, searchWikipediaCategory, getArticleContent };