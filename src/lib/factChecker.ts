interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function checkArticleFacts(title: string, content: string) {
  try {
    const prompt = `As a fact-checker for AfroWiki, an encyclopedia focused on Black history and culture, please verify the accuracy of the following article. Focus only on identifying and correcting any inaccurate statements.

Title: ${title}

Content:
${content}

Please analyze each factual claim and:
1. If all facts are accurate, respond with "All facts in this article are verified as accurate."
2. If any facts are inaccurate, list only the incorrect statements and provide the correct information written in green, you will write under it in italic font with reliable sources. Only mentionned the innacurate statement and their corrected statement. 

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
