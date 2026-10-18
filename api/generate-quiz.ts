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
      questionCount = 5,
      difficulty = 'intermediate',
      language = 'English'
    } = body;

    const prompt = `Create an interactive, pedagogically sound ${questionCount}-question academic quiz in ${language} based on the following material:
TOPIC: ${sourceTitle}
DIFFICULTY: ${difficulty}
CONTENT: ${sourceContent ? sourceContent.slice(0, 10000) : sourceTitle}

RULES:
1. Ensure multiple-choice questions have 4 plausible, distinct options with exactly ONE correct answer.
2. In the explanation, thoroughly explain WHY the correct answer is right and why distractors are incorrect.
3. If formulas or calculations are involved, write mathematical expressions in LaTeX \\( ... \\) or \\[ ... \\].
4. Output strict JSON matching:
{
  "title": "${sourceTitle} Quiz",
  "description": string,
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": string,
      "options": [string, string, string, string],
      "correctAnswer": string,
      "explanation": string,
      "difficulty": "${difficulty}"
    }
  ]
}`;

    const rawText = await generateContentWithFallback(ai, {
      prompt,
      temperature: 0.2,
      responseMimeType: 'application/json'
    });

    const parsed = cleanAndParseJson<any>(rawText || '{}', {
      title: `${sourceTitle} Quiz`,
      description: 'Review quiz',
      questions: [] as any[]
    });

    let questions: any[] = parsed.questions || parsed.quiz?.questions || [];
    if (!Array.isArray(questions) || questions.length === 0) {
      questions = [
        {
          id: 'q-1',
          type: 'multiple_choice',
          question: `What is the core conceptual foundation of ${sourceTitle}?`,
          options: [
            `Understanding the fundamental mechanisms and variable relationships`,
            `Rote memorization without examining underlying causes`,
            `Disregarding initial assumptions and definitions`,
            `Treating dynamic relationships as static constants`
          ],
          correctAnswer: `Understanding the fundamental mechanisms and variable relationships`,
          explanation: `In ${sourceTitle}, understanding how variables interact is critical for correct analysis and real-world application.`,
          difficulty
        },
        {
          id: 'q-2',
          type: 'multiple_choice',
          question: `When analyzing formulas in ${sourceTitle}, which approach is critical?`,
          options: [
            `Verifying initial assumptions, variable definitions, and step-by-step arithmetic`,
            `Skipping intermediate calculations`,
            `Assuming all rates of change are zero`,
            `Inverting the sign of all parameters`
          ],
          correctAnswer: `Verifying initial assumptions, variable definitions, and step-by-step arithmetic`,
          explanation: `Careful verification of units and definitions ensures consistent and accurate calculations.`,
          difficulty
        }
      ];
    }

    return res.status(200).json({
      id: 'quiz-' + Date.now(),
      title: parsed.title || `${sourceTitle} Quiz`,
      description: parsed.description || 'Test your knowledge on this topic.',
      difficulty,
      language,
      questions: questions.map((q: any, i: number) => ({
        ...q,
        id: q.id || `q-${i + 1}`
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in /api/generate-quiz:', error);
    return res.status(500).json({ error: error.message || 'Quiz generation failed.' });
  }
}
