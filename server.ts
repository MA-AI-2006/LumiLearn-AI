import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// Helper to sanitize and safely parse model JSON responses
// Robust JSON sanitizer that handles LaTeX backslashes and truncated model responses
function cleanAndParseJson<T>(rawText: string, fallback: T): T {
  if (!rawText) return fallback;

  let text = rawText.trim();

  // 1. Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // 2. Extract substring between first '{' and last '}' or '[' and ']'
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

  // Attempt 1: Direct JSON.parse
  try {
    return JSON.parse(jsonCandidate) as T;
  } catch (err1) {
    // Attempt 2: Sanitize LaTeX backslashes that invalidate standard JSON
    // Valid escapes in JSON strings are: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
    try {
      const sanitized = jsonCandidate.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');
      return JSON.parse(sanitized) as T;
    } catch (err2) {
      // Attempt 3: Repair unclosed brackets or trailing truncation
      try {
        const repaired = repairTruncatedJson(jsonCandidate);
        const sanitizedRepaired = repaired.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');
        return JSON.parse(sanitizedRepaired) as T;
      } catch (err3) {
        console.warn('All JSON parsing attempts failed. Using fallback.');
        return fallback;
      }
    }
  }
}

const parseJsonResponse = cleanAndParseJson;

// Repair truncated or unclosed JSON
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

  // Sanitize backslashes
  return str.replace(/\\(?!["\\/])/g, '\\\\');
}

// Academic Fallback if model output was pure Markdown or non-JSON
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
          content: currentLines.join('\n').trim()
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
      content: currentLines.join('\n').trim()
    });
  }

  if (sections.length === 0) {
    sections.push({
      id: 'sec-1',
      title: '1. Conceptual Foundation & Mathematical Framework',
      level: 1,
      content:
        clean ||
        `Comprehensive study notes for ${sourceTitle}. Key principles are structured with conceptual intuition, rigorous explanations, and practical applications.`
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

// 1. ENDPOINT: Generate Detailed, Teaching-First Study Notes
app.post('/api/generate-notes', async (req, res) => {
  try {
    const {
      sourceTitle = 'Study Document',
      sourceContent = '',
      detailLevel = 'detailed',
      academicLevel = 'university',
      language = 'English',
      includeFormulas = true,
      includeDefinitions = true,
      includeExamples = true
    } = req.body;

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
            "steps": [ { "step": string, "calculation": string, "result": string } ],
            "finalAnswer": string,
            "interpretation": string
          },
          "commonMistakes": string[]
        }
      ]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    let parsed = cleanAndParseJson<any>(response.text || '{}', null);
    let sections = parsed?.sections || parsed?.note?.sections || parsed?.studyNotes?.sections || parsed?.data?.sections;

    if (!parsed || !Array.isArray(sections) || sections.length === 0) {
      console.warn('Model response did not contain structured sections. Synthesizing structured note.');
      parsed = fallbackStructuredNote(
        response.text || sourceContent,
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
      overview: parsed.overview || `Comprehensive study notes on ${sourceTitle} designed for ${academicLevel} level understanding.`,
      detailLevel,
      academicLevel,
      language,
      tags: parsed.tags && Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : [sourceTitle.split(':')[0] || 'Study Notes'],
      sections: sections || [],
      summary: parsed.summary || 'Structured chapter reviewing core definitions, mathematical mechanisms, and takeaways.',
      keyTakeaways: parsed.keyTakeaways && Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0 ? parsed.keyTakeaways : [
        `Master the foundational definitions and core principles of ${sourceTitle}.`,
        `Understand the step-by-step mathematical reasoning and variable relationships.`,
        `Apply worked methods to academic and exam scenarios.`
      ],
      revisionChecklist: parsed.revisionChecklist && Array.isArray(parsed.revisionChecklist) && parsed.revisionChecklist.length > 0 ? parsed.revisionChecklist : [
        'Review key terms and notation.',
        'Practice the step-by-step calculations without referring to the notes.',
        'Verify cause-and-effect relationships across concepts.'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.json(completeNote);
  } catch (error: any) {
    console.error('Error in /api/generate-notes:', error);
    res.status(500).json({
      error: 'Note generation failed: ' + (error.message || 'Unknown error')
    });
  }
});

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

// 2. ENDPOINT: AI Tutor Conversation
app.post('/api/ai-tutor', async (req, res) => {
  try {
    const {
      message,
      conversationHistory = [],
      explanationLevel = 'university',
      contextDocument = null
    } = req.body;

    const levelInstructions = {
      beginner: 'Explain like I am new to this. Use simple analogies, avoid confusing jargon, and define terms before using them.',
      school: 'Explain at high school student level with clear step-by-step guidance and relatable examples.',
      university: 'Explain at undergraduate university level. Provide theoretical rigor, economic/mathematical intuition, and structured derivations.',
      advanced: 'Explain at advanced/graduate level with formal notation, underlying assumptions, proofs, and edge case conditions.'
    }[explanationLevel as 'beginner' | 'school' | 'university' | 'advanced'] || 'Explain clearly with intuition.';

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: messagesFormatted,
      config: {
        systemInstruction: systemContext,
        temperature: 0.3
      }
    });

    const replyText = response.text || "I'm here to help. Could you please clarify your question?";

    // Extract suggested follow-ups if present
    let content = replyText;
    let suggestedFollowUps: string[] = [];
    if (replyText.includes('SUGGESTED_FOLLOW_UPS:')) {
      const parts = replyText.split('SUGGESTED_FOLLOW_UPS:');
      content = parts[0].trim();
      const followUpLines = parts[1]
        .split('\n')
        .map(l => l.replace(/^[-*0-9.]+\s*/, '').trim())
        .filter(l => l.length > 5);
      suggestedFollowUps = followUpLines.slice(0, 3);
    }

    if (suggestedFollowUps.length === 0) {
      suggestedFollowUps = [
        'Can you show another worked example?',
        'How does this relate to real-world applications?',
        'Test my understanding with a quick question!'
      ];
    }

    res.json({
      role: 'assistant',
      content,
      suggestedFollowUps
    });
  } catch (error: any) {
    console.error('Error in /api/ai-tutor:', error);
    res.status(500).json({
      error: 'Tutor service error: ' + (error.message || 'Unknown error')
    });
  }
});

// 3. ENDPOINT: Generate Interactive Quizzes
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const {
      sourceTitle = 'Study Material',
      sourceContent = '',
      questionCount = 5,
      difficulty = 'intermediate',
      language = 'English'
    } = req.body;

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsed = parseJsonResponse<any>(response.text || '{}', {
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

    res.json({
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
    res.status(500).json({ error: 'Quiz generation failed: ' + error.message });
  }
});

// 4. ENDPOINT: Generate High-Yield Flashcards
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const {
      sourceTitle = 'Study Material',
      sourceContent = '',
      cardCount = 6,
      subject = 'General'
    } = req.body;

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsed = parseJsonResponse<any>(response.text || '{}', {
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

    res.json({
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
    res.status(500).json({ error: 'Flashcard generation failed: ' + error.message });
  }
});

// 5. ENDPOINT: Academic Translation with RTL & LaTeX Preservation
app.post('/api/translate-note', async (req, res) => {
  try {
    const { note, targetLanguage = 'Urdu' } = req.body;

    const isRTL = targetLanguage === 'Urdu' || targetLanguage === 'Arabic' || targetLanguage === 'Farsi';

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
  title: note.title,
  overview: note.overview,
  summary: note.summary,
  sections: note.sections.map((s: any) => ({ id: s.id, title: s.title, level: s.level, content: s.content }))
})}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const parsed = parseJsonResponse<any>(response.text || '{}', null);
    const translatedSections = (parsed?.translatedSections && Array.isArray(parsed.translatedSections) && parsed.translatedSections.length > 0)
      ? parsed.translatedSections.map((s: any) => ({ ...s, formulas: [] }))
      : note.sections.map((s: any) => ({
          id: s.id,
          title: `${s.title} (${targetLanguage})`,
          level: s.level,
          content: s.content,
          formulas: []
        }));

    res.json({
      id: 'trans-' + Date.now(),
      sourceNoteId: note.id,
      sourceNoteTitle: note.title,
      sourceLanguage: note.language || 'English',
      targetLanguage,
      isRTL,
      translatedTitle: parsed?.translatedTitle || `${note.title} (${targetLanguage})`,
      translatedOverview: parsed?.translatedOverview || note.overview,
      translatedSummary: parsed?.translatedSummary || note.summary,
      translatedSections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in /api/translate-note:', error);
    res.status(500).json({ error: 'Translation failed: ' + error.message });
  }
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Only start listening when not running as a Vercel serverless function
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`LumiLearn AI server running at http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
