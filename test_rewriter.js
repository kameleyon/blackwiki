// Test script for the Article Rewriter Agent
const { ArticleRewriterAgent } = require('./src/lib/articleRewriter.ts');

async function testRewriter() {
  try {
    console.log('Testing Article Rewriter Agent...');
    
    // Test with the first available article
    const candidateIds = await ArticleRewriterAgent.getCandidateArticles(1);
    
    if (candidateIds.length === 0) {
      console.log('No candidate articles found for testing');
      return;
    }
    
    const articleId = candidateIds[0];
    console.log(`Testing with article ID: ${articleId}`);
    
    // Test single article rewrite
    const result = await ArticleRewriterAgent.rewriteArticle(articleId, {
      enhanceFactualContent: true,
      addSources: true,
      preserveOriginalStructure: false
    });
    
    console.log('Rewrite Results:');
    console.log(`- Success: ${result.success}`);
    console.log(`- Original Length: ${result.originalLength}`);
    console.log(`- New Length: ${result.newLength}`);
    console.log(`- Expansion Factor: ${result.expansionFactor}x`);
    console.log(`- Quality Score: ${result.qualityScore}/10`);
    
    if (!result.success) {
      console.error(`- Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testRewriter();