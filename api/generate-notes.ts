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
    systemInstruction?: string;
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
          systemInstruction: options.systemInstruction,
          responseMimeType: options.responseMimeType
        }
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} failed: ${err?.message || err}. Trying next fallback candidate...`);
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
    try {
      const sanitized = jsonCandidate.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');
      return JSON.parse(sanitized) as T;
    } catch {
      try {
        const repaired = repairTruncatedJson(jsonCandidate);
        return JSON.parse(repaired) as T;
      } catch {
        return fallback;
      }
    }
  }
}

function repairTruncatedJson(jsonStr: string): string {
  let str = jsonStr.trim();
  let inString = false;
  let escape = false;
  const stack: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack[stack.length - 1] === '{') stack.pop();
      } else if (char === ']') {
        if (stack[stack.length - 1] === '[') stack.pop();
      }
    }
  }

  if (inString) str += '"';
  str = str.replace(/,\s*$/, '');

  while (stack.length > 0) {
    const open = stack.pop();
    if (open === '{') str += '}';
    else if (open === '[') str += ']';
  }

  return str.replace(/\\(?!["\\/])/g, '\\\\');
}

function fallbackStructuredNote(
  rawText: string,
  sourceTitle: string,
  detailLevel: string,
  academicLevel: string,
  language: string
) {
  const clean = rawText.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
  const lines = clean.split('\n');
  const sections: any[] = [];
  let currentTitle = '1. Topic Overview & Core Intuition';
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.match(/^#{1,3}\s+/) || line.match(/^[0-9]+\.\s+[A-Z]/)) {
      if (currentLines.length > 0) {
        sections.push({
          id: 'sec-' + (sections.length + 1),
          title: currentTitle,
          level: 1,
          content: currentLines.join('\n').trim(),
          formulas: []
        });
        currentLines = [];
      }
      currentTitle = line.replace(/^#{1,3}\s+/, '').trim();
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    sections.push({
      id: 'sec-' + (sections.length + 1),
      title: currentTitle,
      level: 1,
      content: currentLines.join('\n').trim(),
      formulas: []
    });
  }

  if (sections.length === 0) {
    sections.push({
      id: 'sec-1',
      title: '1. Conceptual Foundation & Mathematical Framework',
      level: 1,
      content:
        clean ||
        `Comprehensive study notes for ${sourceTitle}. Key principles are structured with conceptual intuition, rigorous explanations, and practical applications.`,
      formulas: []
    });
  }

  return {
    title: sourceTitle,
    overview: `Detailed pedagogical study notes on ${sourceTitle} designed for ${academicLevel} level understanding.`,
    summary: `Structured chapter reviewing the primary definitions, behavioral mechanisms, formulas, and takeaways.`,
    keyTakeaways: [
      `Master the foundational definitions and core principles of ${sourceTitle}.`,
      `Understand the step-by-step mathematical reasoning and variable relationships.`,
      `Apply worked methods to academic and exam scenarios.`
    ],
    revisionChecklist: [
      `Review key terms and notation.`,
      `Practice the step-by-step calculations without referring to the notes.`,
      `Verify cause-and-effect relationships across concepts.`
    ],
    tags: [sourceTitle.split(':')[0] || 'Study Notes'],
    sections
  };
}

function detailSettingDescription(level: string) {
  switch (level) {
    case 'comprehensive':
      return 'Comprehensive Chapter (Extensive textbook quality)';
    case 'detailed':
      return 'Detailed Study Notes (Deep explanations & worked examples)';
    case 'standard':
      return 'Standard Notes (Balanced coverage)';
    case 'quick':
      return 'Quick Revision (High-yield essentials)';
    default:
      return 'Detailed Study Notes';
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
      sourceTitle = 'Study Document',
      sourceContent = '',
      detailLevel = 'detailed',
      academicLevel = 'university',
      language = 'English',
      includeFormulas = true,
      includeDefinitions = true,
      includeExamples = true
    } = body;

    const detailInstruction =
      detailLevel === 'comprehensive'
        ? 'Generate exhaustive, university textbook-style notes (approx 2000-3000 words if topic warrants) with full conceptual foundations, derivations, worked examples, and deep intuition.'
        : detailLevel === 'detailed'
        ? 'Generate thorough study notes with detailed conceptual explanations, step-by-step formulas, and worked numerical examples.'
        : detailLevel === 'standard'
        ? 'Generate clear standard notes covering all major concepts with concise examples and formulas.'
        : 'Generate a focused quick revision summary with key formulas, essential definitions, and high-yield review bullet points.';

    const prompt = `You are the lead academic professor and instructional designer for LumiLearn AI.
Your mission is to transform the provided educational material into exceptional, teaching-first study notes in ${language}.

SOURCE TITLE: "${sourceTitle}"
ACADEMIC LEVEL: ${academicLevel}
DETAIL SETTING: ${detailSettingDescription(detailLevel)}
${detailInstruction}

SOURCE CONTENT:
${sourceContent ? sourceContent.slice(0, 15000) : 'Provide an in-depth lecture on this topic: ' + sourceTitle}

CRITICAL PEDAGOGICAL INSTRUCTIONS:
1. TEACH BEFORE TESTING: Explain the intuition and reasoning before presenting any formula or technical theorem.
2. MATHEMATICAL FORMULAS (CORE REQUIREMENT):
   - NEVER output raw unformatted LaTeX strings in plain text.
   - For every formula, provide both standard LaTeX (e.g. \\( P^* \\) or \\[ E_d = \\dots \\]) AND an easy-to-understand plain language representation.
   - For every formula, detail:
     * name: Formula name
     * latex: Clean LaTeX string
     * plainVersion: A plain-English intuitive explanation or simplified equation
     * purpose: What this formula tells us in simple language
     * symbols: Array of { symbol, meaning } defining every variable
     * stepByStepMethod: Numbered steps to use the formula
     * workedExample: A realistic scenario with givenValues, steps array with calculations, finalAnswer, and interpretation!
     * commonMistakes: Common student errors
3. NO HALLUCINATION: Ground the core subject strictly in real knowledge.
4. RETURN FORMAT: Strictly valid JSON matching this schema:
{
  "title": string,
  "overview": string,
  "summary": string,
  "keyTakeaways": string[],
  "revisionChecklist": string[],
  "tags": string[],
  "sections": [
    {
      "id": "sec-1",
      "title": "1. Section Heading",
      "level": 1,
      "content": "Rich markdown paragraphs explaining concepts thoroughly. Use \\( inline \\) and \\[ display \\] math where appropriate.",
      "keyDefinitions": [ { "term": string, "definition": string } ],
      "examples": [ { "title": string, "explanation": string } ],
      "formulas": [
        {
          "name": string,
          "latex": string,
          "plainVersion": string,
          "purpose": string,
          "symbols": [ { "symbol": string, "meaning": string } ],
          "stepByStepMethod": string[],
          "workedExample": {
            "problem": string,
            "givenValues": string,
            "steps": string[],
            "finalAnswer": string,
            "practicalInterpretation": string
          },
          "commonMistakes": string[]
        }
      ]
    }
  ]
}`;

    const rawText = await generateContentWithFallback(ai, {
      prompt,
      temperature: 0.2,
      responseMimeType: 'application/json'
    });

    let parsed = cleanAndParseJson<any>(rawText || '{}', null);
    let sections =
      parsed?.sections ||
      parsed?.note?.sections ||
      parsed?.studyNotes?.sections ||
      parsed?.data?.sections;

    if (!parsed || !Array.isArray(sections) || sections.length === 0) {
      console.warn('Model response did not contain structured sections. Synthesizing structured note.');
      parsed = fallbackStructuredNote(
        rawText || sourceContent,
        sourceTitle,
        detailLevel,
        academicLevel,
        language
      );
      sections = parsed.sections;
    }

    const completeNote = {
      id: 'note-' + Date.now(),
      title: parsed.title || sourceTitle,
      overview:
        parsed.overview ||
        `Comprehensive study notes on ${sourceTitle} designed for ${academicLevel} level understanding.`,
      detailLevel,
      academicLevel,
      language,
      tags:
        parsed.tags && Array.isArray(parsed.tags) && parsed.tags.length > 0
          ? parsed.tags
          : [sourceTitle.split(':')[0] || 'Study Notes'],
      sections: sections || [],
      summary:
        parsed.summary ||
        'Structured chapter reviewing core definitions, mathematical mechanisms, and takeaways.',
      keyTakeaways:
        parsed.keyTakeaways && Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0
          ? parsed.keyTakeaways
          : [
              `Master the foundational definitions and core principles of ${sourceTitle}.`,
              `Understand the step-by-step mathematical reasoning and variable relationships.`,
              `Apply worked methods to academic and exam scenarios.`
            ],
      revisionChecklist:
        parsed.revisionChecklist &&
        Array.isArray(parsed.revisionChecklist) &&
        parsed.revisionChecklist.length > 0
          ? parsed.revisionChecklist
          : [
              'Review key terms and notation.',
              'Practice the step-by-step calculations without referring to the notes.',
              'Verify cause-and-effect relationships across concepts.'
            ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return res.status(200).json(completeNote);
  } catch (error: any) {
    console.error('Error in /api/generate-notes:', error);
    return res.status(500).json({
      error: error.message || 'Note generation failed on server.'
    });
  }
}
