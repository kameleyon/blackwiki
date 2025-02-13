interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function checkArticleFacts(title: string, content: string) {
  try {
    const prompt = `As a fact-checker for BlackWiki, an encyclopedia focused on Black history and culture, please analyze the following article for accuracy. Use your web access capabilities to verify claims against reliable sources.

Title: ${title}

Content:
${content}

Please provide:
1. A list of factual claims that need verification (with web sources where possible)
2. Suggestions for additional sources or citations
3. Overall accuracy assessment (High, Medium, Low)
4. Specific recommendations for improvement`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://blackwiki.com',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'perplexity/llama-3.1-sonar-large-128k-online',
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

    return {
      analysis: data.choices[0].message.content,
      success: true,
    };
  } catch (error) {
    console.error('Fact checking error:', error);
    return {
      analysis: "Error performing fact check. Please try again.",
      success: false,
    };
  }
}
