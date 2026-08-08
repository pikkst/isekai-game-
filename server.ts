import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { processStartGame, processTurnAction } from './server/isekaiEngine.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.post('/api/isekai/start', async (req, res) => {
    try {
      const result = await processStartGame(req.body);
      res.json(result);
    } catch (err: unknown) {
      console.error('Error in /api/isekai/start:', err);
      res.status(500).json({ error: 'Failed to start game session' });
    }
  });

  app.post('/api/isekai/turn', async (req, res) => {
    try {
      const result = await processTurnAction(req.body);
      res.json(result);
    } catch (err: unknown) {
      console.error('Error in /api/isekai/turn:', err);
      res.status(500).json({ error: 'Failed to process turn action' });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`Isekai RPG Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
