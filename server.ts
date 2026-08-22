import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/routes/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS and COOP headers for Firebase popup authentication
  app.use((_req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
  });

  // API Routes First
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'Velora Store API', timestamp: new Date().toISOString() });
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server Error Stack:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err?.message || String(err),
      stack: err?.stack || undefined
    });
  });

  // Vite middleware for development vs static dist for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Velora Store Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
