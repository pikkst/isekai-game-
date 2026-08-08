import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { StartGameRequestSchema, TurnActionRequestSchema } from '@isekai/contracts';
import type { StartGameResponse, TurnResponse } from './engine';
import { gameEngine } from './engine';
import { sessionStore } from './sessionStore';
import type { SessionRecord } from './sessionStore';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  app.use((req: Request, _res: Response, next: Function) => {
    const requestId = req.headers['x-request-id'] || randomUUID();
    console.log(`[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path}`);
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
      const parseResult = StartGameRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid start game request',
          code: 'BAD_REQUEST',
          details: parseResult.error.errors,
        });
      }

      const { sessionId, idempotencyKey, ...creationParams } = parseResult.data;

      const cached = sessionStore.getIdempotencyResult(idempotencyKey);
      if (cached) {
        return res.json(cached);
      }

      const resolvedSessionId = sessionId || sessionStore.generateSessionId();

      const existing = sessionStore.getSession(resolvedSessionId);
      if (existing) {
        return res.status(409).json({
          error: 'Session already exists',
          code: 'CONFLICT',
        });
      }

      const response: StartGameResponse = await gameEngine.startGame(
        { ...creationParams, sessionId: resolvedSessionId, idempotencyKey },
        resolvedSessionId,
      );

      const record: SessionRecord = {
        id: resolvedSessionId,
        state: response.initialState,
        worldArchetype: creationParams.worldArchetype,
        reincarnationMethod: creationParams.reincarnationMethod,
        customWorldPrompt: creationParams.customWorldPrompt,
        customCheatPrompt: creationParams.customCheatPrompt,
      };
      sessionStore.saveSession(record);

      sessionStore.setIdempotencyResult(idempotencyKey, resolvedSessionId, response);

      return res.json({
        sessionId: resolvedSessionId,
        turnResult: response.turnResult,
      });
    } catch (err: unknown) {
      console.error('Error in /api/isekai/start:', err);
      return res.status(500).json({
        error: 'Failed to start game session',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  app.post('/api/isekai/turn', async (req: Request, res: Response) => {
    try {
      const parseResult = TurnActionRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid turn action request',
          code: 'BAD_REQUEST',
          details: parseResult.error.errors,
        });
      }

      const { sessionId, idempotencyKey, action } = parseResult.data;

      const cached = sessionStore.getIdempotencyResult(idempotencyKey);
      if (cached) {
        return res.json(cached);
      }

      const record = sessionStore.getSession(sessionId);
      if (!record) {
        return res.status(404).json({
          error: 'Session not found',
          code: 'NOT_FOUND',
        });
      }

      const response: TurnResponse = await gameEngine.processTurn(record, action);

      sessionStore.saveSession({
        ...record,
        state: response.updatedState,
      });

      sessionStore.setIdempotencyResult(idempotencyKey, sessionId, response);

      return res.json({
        turnResult: response.turnResult,
      });
    } catch (err: unknown) {
      console.error('Error in /api/isekai/turn:', err);
      return res.status(500).json({
        error: 'Failed to process turn action',
        code: 'INTERNAL_ERROR',
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
