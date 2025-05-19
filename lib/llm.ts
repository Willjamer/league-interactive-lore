// LLM API integration for OpenRouter Gemini 2.0 Flash
// Usage: await getGeminiChatResponse(messages, apiKey)

export type LLMMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function getGeminiChatResponse(messages: LLMMessage[], apiKey: string, siteUrl?: string, siteTitle?: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(siteUrl ? { 'HTTP-Referer': siteUrl } : {}),
      ...(siteTitle ? { 'X-Title': siteTitle } : {}),
    },
    body: JSON.stringify({
      model: 'google/gemini-flash-1.5',
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  // OpenRouter returns choices[0].message.content
  return data.choices?.[0]?.message?.content || '';
}
