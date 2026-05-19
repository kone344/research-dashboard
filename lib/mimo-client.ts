const BASE_URL = 'https://opengateway.gitlawb.com/v1/xiaomi-mimo';
const MODEL = 'mimo-v2.5-pro';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  choices: {
    message: {
      content: string;
      reasoning_content?: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export async function chat(
  messages: ChatMessage[],
  options: {
    max_tokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const { max_tokens = 2048, temperature = 0.7 } = options;

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`MiMo API error ${response.status}: ${text}`);
  }

  const data: ChatResponse = await response.json();
  return data.choices[0]?.message?.content || '';
}

export async function chatJSON<T>(
  messages: ChatMessage[],
  options: { max_tokens?: number; temperature?: number } = {}
): Promise<T> {
  const text = await chat(messages, options);

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const jsonStr = (jsonMatch[1] || text).trim();

  return JSON.parse(jsonStr) as T;
}
