import express from 'express';
import { apiRouter } from '../server/apiRouter';

const app = express();

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health check root
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: 'vercel-serverless',
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Mount router on both '/api' and '/' to ensure requests match whether Vercel strips or preserves the prefix
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global fallback error handler to guarantee valid JSON responses on error
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: err?.message || 'Internal server error occurred in LumiLearn API.',
    path: req.originalUrl || req.url
  });
});

export default app;
