import { randomUUID } from 'crypto';
import type { GameStateSnapshot } from '@isekai/contracts';

export interface SessionRecord {
  id: string;
  state: GameStateSnapshot;
  worldArchetype: string;
  reincarnationMethod: string;
  customWorldPrompt?: string;
  customCheatPrompt?: string;
}

export class SessionStore {
  private sessions: Map<string, SessionRecord> = new Map();
  private idempotencyKeys: Map<string, { sessionId: string; result: unknown; timestamp: number }> = new Map();
  private readonly IDEMPOTENCY_TTL_MS = 300_000;

  getSession(sessionId: string): SessionRecord | undefined {
    return this.sessions.get(sessionId);
  }

  saveSession(record: SessionRecord): void {
    this.sessions.set(record.id, record);
  }

  generateSessionId(): string {
    return randomUUID();
  }

  getIdempotencyResult(key: string): unknown | undefined {
    const entry = this.idempotencyKeys.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > this.IDEMPOTENCY_TTL_MS) {
      this.idempotencyKeys.delete(key);
      return undefined;
    }
    return entry.result;
  }

  setIdempotencyResult(key: string, sessionId: string, result: unknown): void {
    this.idempotencyKeys.set(key, { sessionId, result, timestamp: Date.now() });
  }
}

export const sessionStore = new SessionStore();
