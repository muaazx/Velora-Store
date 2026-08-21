import express, { Request, Response } from 'express';
import { apiRouter } from '../src/server/routes/api';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS & COOP headers for Firebase popup authentication
app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Mount Express API Router under /api
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', name: 'BazaarNova API', timestamp: new Date().toISOString() });
});

export default app;
