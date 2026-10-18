import { GoogleGenAI } from '@google/genai';

function handleCors(req: any, res: any): boolean {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

function parseBody(req: any): any {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    ''
  ).trim();
}

function getAiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in Vercel. Please add GEMINI_API_KEY in Vercel Project Settings > Environment Variables, and then REDEPLOY your project.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'lumilearn-ai'
      }
    }
  });
}

async function generateContentWithFallback(
  ai: GoogleGenAI,
  options: {
    prompt: string;
    temperature?: number;
    responseMimeType?: string;
  }
): Promise<string> {
  const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.prompt,
        config: {
          temperature: options.temperature ?? 0.2,
          responseMimeType: options.responseMimeType
        }
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      if (err?.message?.includes('API_KEY_INVALID') || err?.status === 401 || err?.status === 403) {
        throw new Error(
          'Invalid Gemini API Key provided. Please verify GEMINI_API_KEY in Vercel Project Settings > Environment Variables and redeploy.'
        );
      }
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API.');
}

function cleanAndParseJson<T>(rawText: string, fallback: T): T {
  if (!rawText) return fallback;
  let text = rawText.trim();

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');

  let jsonCandidate = text;
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    if (firstBracket !== -1 && firstBracket < firstBrace && lastBracket > lastBrace) {
      jsonCandidate = text.slice(firstBracket, lastBracket + 1);
    } else {
      jsonCandidate = text.slice(firstBrace, lastBrace + 1);
    }
  }

  try {
    return JSON.parse(jsonCandidate) as T;
  } catch {
    return fallback;
  }
}

export default async function handler(req: any, res: any) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const ai = getAiClient();
    const body = parseBody(req);
    const {
      sourceTitle = 'Study Material',
      sourceContent = '',
      cardCount = 6,
      subject = 'General'
    } = body;

    const prompt = `Generate ${cardCount} high-yield, memory-enhancing flashcards based on:
TOPIC: ${sourceTitle}
SUBJECT: ${subject}
CONTENT: ${sourceContent ? sourceContent.slice(0, 8000) : sourceTitle}

RULES:
- Each card must test ONE key concept, formula, mechanism, or definition.
- The front should be a clear, focused prompt or question.
- The back must be a clear, accurate answer.
- Provide an "easyExplanation" in simple, friendly words.
- If it includes a formula, provide "formulaLatex" using standard LaTeX notation.
- Return JSON:
{
  "title": "${sourceTitle} Flashcards",
  "subject": "${subject}",
  "cards": [
    {
      "id": "c1",
      "front": string,
      "back": string,
      "easyExplanation": string,
      "formulaLatex": string
    }
  ]
}`;

    const rawText = await generateContentWithFallback(ai, {
      prompt,
      temperature: 0.2,
      responseMimeType: 'application/json'
    });

    const parsed = cleanAndParseJson<any>(rawText || '{}', {
      title: `${sourceTitle} Flashcards`,
      subject,
      cards: []
    });

    let cards = parsed.cards || parsed.deck?.cards || [];
    if (!Array.isArray(cards) || cards.length === 0) {
      cards = [
        {
          id: 'c-1',
          front: `What is the core intuition of ${sourceTitle}?`,
          back: `The fundamental concepts and mechanisms that explain how this topic operates.`,
          easyExplanation: `Focus on the 'why' and foundational definitions before diving into advanced formulas.`,
          formulaLatex: ''
        },
        {
          id: 'c-2',
          front: `How should you solve problems in ${sourceTitle}?`,
          back: `Identify given values, state the relevant formula, substitute variables, and check units.`,
          easyExplanation: `Breaking calculations into clear sequential steps prevents arithmetic mistakes.`,
          formulaLatex: ''
        }
      ];
    }

    return res.status(200).json({
      id: 'deck-' + Date.now(),
      title: parsed.title || `${sourceTitle} Flashcards`,
      subject: parsed.subject || subject,
      cards: cards.map((c: any, i: number) => ({
        ...c,
        id: c.id || `c-${i + 1}`,
        status: 'new'
      })),
      cardsMastered: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in /api/generate-flashcards:', error);
    return res.status(500).json({ error: error.message || 'Flashcard generation failed.' });
  }
}
