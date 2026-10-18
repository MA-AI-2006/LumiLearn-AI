import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import healthHandler from './api/health';
import generateNotesHandler from './api/generate-notes';
import aiTutorHandler from './api/ai-tutor';
import generateQuizHandler from './api/generate-quiz';
import generateFlashcardsHandler from './api/generate-flashcards';
import translateNoteHandler from './api/translate-note';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Mount API routes that match the Vercel serverless functions
app.get('/api/health', (req, res) => healthHandler(req, res));
app.get('/api', (req, res) => healthHandler(req, res));
app.post('/api/generate-notes', (req, res) => generateNotesHandler(req, res));
app.post('/api/ai-tutor', (req, res) => aiTutorHandler(req, res));
app.post('/api/generate-quiz', (req, res) => generateQuizHandler(req, res));
app.post('/api/generate-flashcards', (req, res) => generateFlashcardsHandler(req, res));
app.post('/api/translate-note', (req, res) => translateNoteHandler(req, res));

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
