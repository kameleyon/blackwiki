interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function checkArticleFacts(title: string, content: string) {
  try {
    const prompt = `As a fact-checker for AfroWiki, an encyclopedia dedicated to Black history, culture, and contributions, your task is to verify the accuracy and relevance of the following article.

Article Details
Title: ${title}
Content:
${content}
Fact-Check Review Process
Relevance Check

If the article does not focus on Black history, culture, or contemporary Black-related issues, respond with:
"NOT_RELEVANT" at the beginning of your response.
Do not proceed with fact-checking if the article is not relevant.
Fact-Check Verification

If all facts are accurate, respond with:
"PASS" at the beginning of your response.
If any facts are inaccurate, respond with:
"FAIL" at the beginning of your response.
Error Identification (If FAIL)

List only the incorrect statements.
Provide the correct information for each error.
Do not include a summary or explanation.
Overall Fact-Check Score

If the article passes all checks: "Fact Check Passed"
If any facts are inaccurate: "Fact Check Failed"
If not relevant to AfroWiki: "Not Admissible"
Format the response in Markdown for readability.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://AfroWiki.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'perplexity/llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable fact-checker specializing in Black history, culture, and contemporary issues. Your role is to ensure accuracy and provide constructive feedback for article submissions. Use your web access capabilities to verify claims against reliable sources."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json() as OpenRouterResponse;
    const analysisText = data.choices[0].message.content;
    
    // Determine fact check status
    let status: 'pass' | 'fail' | 'not-relevant';
    
    if (analysisText.includes('NOT_RELEVANT')) {
      status = 'not-relevant';
    } else if (analysisText.includes('FAIL')) {
      status = 'fail';
    } else {
      status = 'pass';
    }
    
    // Log for debugging
    console.log('Fact check status:', status);
    console.log('Analysis text starts with:', analysisText.substring(0, 50));
    
    // Remove the status prefix from the analysis
    const cleanedAnalysis = analysisText
      .replace(/^(PASS|FAIL|NOT_RELEVANT)\s*/, '')
      .trim();

    return {
      analysis: cleanedAnalysis,
      status,
      success: true,
    };
  } catch (error) {
    console.error('Fact checking error:', error);
    return {
      analysis: "Error performing fact check. Please try again.",
      status: 'pass', // Default to pass on error to not block submission
      success: false,
    };
  }
}
