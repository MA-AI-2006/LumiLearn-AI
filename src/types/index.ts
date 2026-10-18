export type SourceType = 'document' | 'video' | 'audio';
export type NoteDetailLevel = 'quick' | 'standard' | 'detailed' | 'comprehensive';
export type AcademicLevel = 'beginner' | 'school' | 'intermediate' | 'university' | 'advanced';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface SourceMaterial {
  id: string;
  userId?: string;
  title: string;
  sourceType: SourceType;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  sourceUrl?: string;
  summary?: string;
  rawContent?: string;
  processingStatus: 'ready' | 'processing' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface FormulaExplanation {
  name: string;
  latex: string;
  plainVersion?: string; // Easy-to-understand representation
  symbols: { symbol: string; meaning: string }[];
  purpose: string;
  stepByStepMethod: string[];
  workedExample: {
    problem: string;
    givenValues: string;
    steps: { step: string; calculation: string; result: string }[];
    finalAnswer: string;
    interpretation: string;
  };
  commonMistakes?: string[];
}

export interface NoteSection {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  content: string; // Markdown or rich structured text with LaTeX \(...\) or \[...\]
  formulas?: FormulaExplanation[];
  keyDefinitions?: { term: string; definition: string }[];
  examples?: { title: string; explanation: string }[];
  commonMisconceptions?: { misconception: string; correction: string }[];
  practiceQuestions?: { question: string; answer: string; explanation: string }[];
}

export interface NoteDocument {
  id: string;
  userId?: string;
  sourceId?: string;
  sourceTitle?: string;
  sourceType?: SourceType;
  title: string;
  overview: string;
  detailLevel: NoteDetailLevel;
  academicLevel: AcademicLevel;
  language: string;
  tags: string[];
  sections: NoteSection[];
  summary: string;
  keyTakeaways: string[];
  revisionChecklist: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  formulaUsed?: string;
  difficulty: AcademicLevel;
  sourceReference?: string;
}

export interface Quiz {
  id: string;
  userId?: string;
  sourceId?: string;
  noteId?: string;
  title: string;
  description: string;
  difficulty: AcademicLevel;
  language: string;
  questions: QuizQuestion[];
  bestScore?: number;
  lastAttemptAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  userAnswers: Record<string, string>;
  incorrectQuestionIds: string[];
  completedAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  easyExplanation?: string;
  formulaLatex?: string;
  status: 'new' | 'learning' | 'mastered';
  lastReviewed?: string;
}

export interface FlashcardDeck {
  id: string;
  userId?: string;
  sourceId?: string;
  noteId?: string;
  title: string;
  description: string;
  subject: string;
  cards: Flashcard[];
  cardsMastered: number;
  createdAt: string;
  updatedAt: string;
}

export interface TranslationResource {
  id: string;
  userId?: string;
  sourceNoteId: string;
  sourceNoteTitle: string;
  sourceLanguage: string;
  targetLanguage: string;
  isRTL: boolean;
  translatedTitle: string;
  translatedOverview: string;
  translatedSections: NoteSection[];
  translatedSummary: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  formulas?: FormulaExplanation[];
  suggestedFollowUps?: string[];
  timestamp: string;
}

export interface TutorConversation {
  id: string;
  userId?: string;
  title: string;
  sourceId?: string;
  sourceTitle?: string;
  explanationLevel: 'beginner' | 'school' | 'university' | 'advanced';
  messages: TutorMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  displayName: string;
  email: string;
  preferredLanguage: string;
  preferredNoteDetail: NoteDetailLevel;
  preferredQuizDifficulty: AcademicLevel;
  theme: 'light' | 'cream' | 'system';
}
