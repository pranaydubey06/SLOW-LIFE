import express from 'express';
import path from 'path';
import loginHandler from './api/admin/login';
import verifyHandler from './api/admin/verify';
import healthHandler from './api/health';
import songsHandler from './api/songs';
import songByIdHandler from './api/songs/[id]';
import statsHandler from './api/stats';
import { setCorsHeaders } from './api/lib/cors';

const PORT = 3000;
const app = express();

// Set CORS & Body parsing middleware
app.use((req, res, next) => {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});

// Route handlers delegating to Vercel serverless functions
app.all(['/api/health', '/health'], (req, res) => healthHandler(req, res));
app.all(['/api/admin/verify', '/admin/verify'], (req, res) => verifyHandler(req, res));
app.all(['/api/admin/login', '/admin/login'], (req, res) => loginHandler(req, res));
app.all(['/api/songs', '/songs'], (req, res) => songsHandler(req, res));
app.all(['/api/songs/:id', '/songs/:id'], (req, res) => songByIdHandler(req, res));
app.all(['/api/stats', '/stats'], (req, res) => statsHandler(req, res));

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Express API Error:', err);
  res.status(500).json({
    success: false,
    message: err?.message || 'Internal Server Error',
  });
});

export default app;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SLOW LIFE Server] running at http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer();
}
