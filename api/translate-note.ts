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
    const { note, targetLanguage = 'Urdu' } = body;

    const isRTL =
      targetLanguage === 'Urdu' || targetLanguage === 'Arabic' || targetLanguage === 'Farsi';

    const prompt = `You are a scholarly multilingual translator for LumiLearn AI.
Translate the following study document into ${targetLanguage}.

CRITICAL PRESERVATION RULES:
1. PRESERVE ALL MATHEMATICAL FORMULAS EXACTLY AS THEY ARE. Do NOT alter LaTeX syntax (e.g. \\( P^* \\) or \\[ E_d = \\dots \\]). Mathematical symbols must remain in correct left-to-right math layout.
2. For technical terms, translate into ${targetLanguage} and optionally provide the original English term in parentheses where helpful for students.
3. Preserve all headings, section levels, lists, and tables.
4. Return JSON matching:
{
  "translatedTitle": string,
  "translatedOverview": string,
  "translatedSummary": string,
  "translatedSections": [
    {
      "id": string,
      "title": string,
      "level": 1,
      "content": "Translated rich markdown with formulas untouched"
    }
  ]
}

DOCUMENT TO TRANSLATE:
${JSON.stringify({
  title: note?.title || 'Study Note',
  overview: note?.overview || '',
  summary: note?.summary || '',
  sections: (note?.sections || []).map((s: any) => ({
    id: s.id,
    title: s.title,
    level: s.level,
    content: s.content
  }))
})}`;

    const rawText = await generateContentWithFallback(ai, {
      prompt,
      temperature: 0.2,
      responseMimeType: 'application/json'
    });

    const parsed = cleanAndParseJson<any>(rawText || '{}', {
      translatedTitle: note?.title ? `[${targetLanguage}] ${note.title}` : 'Translated Notes',
      translatedOverview: note?.overview || '',
      translatedSummary: note?.summary || '',
      translatedSections: (note?.sections || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        level: s.level,
        content: s.content
      }))
    });

    return res.status(200).json({
      ...parsed,
      isRTL,
      targetLanguage
    });
  } catch (error: any) {
    console.error('Error in /api/translate-note:', error);
    return res.status(500).json({ error: error.message || 'Translation failed.' });
  }
}
