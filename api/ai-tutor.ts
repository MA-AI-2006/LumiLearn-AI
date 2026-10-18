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

export default async function handler(req: any, res: any) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const ai = getAiClient();
    const body = parseBody(req);
    const {
      message,
      conversationHistory = [],
      explanationLevel = 'university',
      contextDocument = null
    } = body;

    const levelInstructions =
      {
        beginner:
          'Explain like I am new to this. Use simple analogies, avoid confusing jargon, and define terms before using them.',
        school:
          'Explain at high school student level with clear step-by-step guidance and relatable examples.',
        university:
          'Explain at undergraduate university level. Provide theoretical rigor, economic/mathematical intuition, and structured derivations.',
        advanced:
          'Explain at advanced/graduate level with formal notation, underlying assumptions, proofs, and edge case conditions.'
      }[explanationLevel as 'beginner' | 'school' | 'university' | 'advanced'] ||
      'Explain clearly with intuition.';

    let systemContext = `You are the LumiLearn AI Personal Academic Tutor.
Your goal is to be patient, encouraging, pedagogically brilliant, and clear.
CURRENT STUDENT LEVEL: ${explanationLevel.toUpperCase()}
LEVEL DIRECTIVE: ${levelInstructions}

PEDAGOGY RULES:
1. Explain the underlying intuition and "why" first.
2. Render mathematical equations using proper LaTeX delimiters: \\( ... \\) for inline equations, and \\[ ... \\] for display block equations.
3. NEVER display raw unformatted code like \\frac without math delimiters.
4. Break calculations down step-by-step and substitute actual numbers.
5. If the student made a mistake, be encouraging: identify the misconception and show how to fix it gently.
6. Suggest 2-3 helpful follow-up questions at the end under a "SUGGESTED_FOLLOW_UPS:" line.`;

    if (contextDocument) {
      systemContext += `\n\nSTUDENT'S CURRENT ACTIVE MATERIAL:
Title: ${contextDocument.title}
Overview: ${contextDocument.overview || ''}
Content excerpt: ${JSON.stringify(contextDocument.sections || []).slice(0, 4000)}
Grounded directive: Use this material as primary reference when answering.`;
    }

    const messagesFormatted = conversationHistory.slice(-6).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    messagesFormatted.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest'];
    let replyText = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: messagesFormatted,
          config: {
            systemInstruction: systemContext,
            temperature: 0.3
          }
        });
        if (response && response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Tutor model ${model} error:`, err?.message || err);
        if (err?.message?.includes('API_KEY_INVALID') || err?.status === 401 || err?.status === 403) {
          throw new Error('Invalid Gemini API Key provided. Please verify GEMINI_API_KEY in Vercel settings.');
        }
      }
    }

    if (!replyText) {
      replyText = "I'm here to help. Could you please clarify your question?";
    }

    let content = replyText;
    let suggestedFollowUps: string[] = [];
    if (replyText.includes('SUGGESTED_FOLLOW_UPS:')) {
      const parts = replyText.split('SUGGESTED_FOLLOW_UPS:');
      content = parts[0].trim();
      const followUpLines = parts[1]
        .split('\n')
        .map((l: string) => l.replace(/^[-*0-9.]+\s*/, '').trim())
        .filter((l: string) => l.length > 5);
      suggestedFollowUps = followUpLines.slice(0, 3);
    }

    if (suggestedFollowUps.length === 0) {
      suggestedFollowUps = [
        'Can you show another worked example?',
        'How does this relate to real-world applications?',
        'Test my understanding with a quick question!'
      ];
    }

    return res.status(200).json({
      role: 'assistant',
      content,
      suggestedFollowUps
    });
  } catch (error: any) {
    console.error('Error in /api/ai-tutor:', error);
    return res.status(500).json({
      error: error.message || 'Tutor service error.'
    });
  }
}
