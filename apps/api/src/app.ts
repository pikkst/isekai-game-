import express, { Request, Response } from 'express';
import { StartGamePayloadSchema, TurnActionPayloadSchema } from '@isekai/contracts';
import { gameEngine } from './engine';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  app.use((req: Request, _res: Response, next: Function) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
      aiProvider: gameEngine.getAIProviderName(),
      aiAvailable: gameEngine.isAIAvailable(),
    });
  });

  app.post('/api/isekai/start', async (req: Request, res: Response) => {
    try {
      const parseResult = StartGamePayloadSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid start game payload',
          code: 'BAD_REQUEST',
          details: parseResult.error.errors,
        });
      }

      const result = await gameEngine.processStartGame(parseResult.data);
      return res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in /api/isekai/start:', err);
      return res.status(500).json({
        error: 'Failed to start game session',
        code: 'INTERNAL_ERROR',
        message,
      });
    }
  });

  app.post('/api/isekai/turn', async (req: Request, res: Response) => {
    try {
      const parseResult = TurnActionPayloadSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid turn action payload',
          code: 'BAD_REQUEST',
          details: parseResult.error.errors,
        });
      }

      const result = await gameEngine.processTurnAction(parseResult.data);
      return res.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in /api/isekai/turn:', err);
      return res.status(500).json({
        error: 'Failed to process turn action',
        code: 'INTERNAL_ERROR',
        message,
      });
    }
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: Function) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  });

  return app;
}
