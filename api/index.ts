import healthHandler from './health.ts';
import generateNotesHandler from './generate-notes.ts';
import aiTutorHandler from './ai-tutor.ts';
import generateQuizHandler from './generate-quiz.ts';
import generateFlashcardsHandler from './generate-flashcards.ts';
import translateNoteHandler from './translate-note.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const rawUrl = req.url || '';
  const pathname = rawUrl.split('?')[0].replace(/^\/api/, '');

  if (pathname === '/health' || pathname === '/health/') {
    return healthHandler(req, res);
  }
  if (pathname === '/generate-notes' || pathname === '/generate-notes/') {
    return generateNotesHandler(req, res);
  }
  if (pathname === '/ai-tutor' || pathname === '/ai-tutor/') {
    return aiTutorHandler(req, res);
  }
  if (pathname === '/generate-quiz' || pathname === '/generate-quiz/') {
    return generateQuizHandler(req, res);
  }
  if (pathname === '/generate-flashcards' || pathname === '/generate-flashcards/') {
    return generateFlashcardsHandler(req, res);
  }
  if (pathname === '/translate-note' || pathname === '/translate-note/') {
    return translateNoteHandler(req, res);
  }

  return healthHandler(req, res);
}
