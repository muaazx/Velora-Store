import express, { Request, Response } from 'express';
import { apiRouter } from './routes/api';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS & COOP headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Health check endpoint
app.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.json({ status: 'ok', name: 'Velora Store API', timestamp: new Date().toISOString() });
});

// Mount router on both /api and / so it works seamlessly with all Vercel URL rewrites
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Serverless Error Stack:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || String(err),
    stack: err?.stack || undefined
  });
});

export default app;
