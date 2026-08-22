import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for cross-origin requests from Vercel frontend
app.use(cors({ origin: '*' }));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// COOP & Custom Headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Health check endpoints
app.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.json({ status: 'ok', name: 'BazaarNova API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server Error Stack:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err?.message || String(err),
    stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined,
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 BazaarNova Server running on port ${PORT}`);
});

export default app;
