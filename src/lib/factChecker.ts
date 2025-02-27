interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function checkArticleFacts(title: string, content: string) {
  try {
    const prompt = `As a fact-checker for AfroWiki, an encyclopedia focused on Black history and culture, please verify the accuracy of the following article and determine if it's relevant to our focus.

Title: ${title}

Content:
${content}

Please analyze this article and provide:

1. A determination of whether this article is relevant to Black history, culture, or contemporary issues. If it's not relevant, respond with "NOT_RELEVANT" at the beginning of your analysis.

2. A fact check assessment:
   - If all facts are accurate, respond with "PASS" at the beginning of your analysis.
   - If any facts are inaccurate, respond with "FAIL" at the beginning of your analysis.

3. A brief analysis explaining your determination (2-3 paragraphs maximum).

4. If there are factual errors, list only the specific incorrect statements and provide corrections.

Format your response in markdown for better readability.`;

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
    let status: 'pass' | 'fail' | 'not-relevant' = 'pass'; // Default to pass
    
    if (analysisText.startsWith('NOT_RELEVANT')) {
      status = 'not-relevant';
    } else if (analysisText.startsWith('FAIL')) {
      status = 'fail';
    }
    
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
