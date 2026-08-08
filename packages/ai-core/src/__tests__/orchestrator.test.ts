import { describe, it, expect, vi } from 'vitest';
import { AIOrchestrator } from '../orchestrator';
import { FakeAIProvider } from '../providers/fake';
import type { AIProvider, AIRequest, AIResponse, AIProviderName } from '../types';
import type { GameTurnResult, StartGamePayload } from '@isekai/contracts';

class FailingProvider implements AIProvider {
  readonly name: AIProviderName = 'fake';
  readonly model: string = 'failing';

  async generateStructured<T>(request: AIRequest<T>): Promise<AIResponse<T>> {
    throw new Error('Deliberate failure for testing');
  }
}

describe('AIOrchestrator fallback behavior', () => {
  it('falls back to deterministic when no API key is provided', async () => {
    const orchestrator = new AIOrchestrator({
      geminiApiKey: undefined,
      enableFakeFallback: true,
    });

    expect(orchestrator.isAIAvailable()).toBe(false);
    expect(orchestrator.getProviderName()).toBe('fake');

    const payload: StartGamePayload = {
      characterName: 'TestHero',
      language: 'en',
      worldArchetype: 'high_fantasy',
      reincarnationMethod: 'truck_kun',
      cheatSkillId: 'cheat_appraisal_steal',
      initialStats: { str: 10, mag: 10, agi: 10, luk: 10 },
    };

    const result = await orchestrator.generateStartGame(payload);
    expect(result.model).toBe('fake-deterministic');
    expect(result.data.narrative).toContain('Blinding');
    expect(result.data.choices).toHaveLength(4);
    expect(result.data.isGameOver).toBe(false);
  });

  it('falls back to deterministic when all configured models fail', async () => {
    const orchestrator = new AIOrchestrator({
      geminiApiKey: 'fake-key-that-will-fail',
      enableFakeFallback: true,
    });

    const payload: StartGamePayload = {
      characterName: 'TestHero',
      language: 'en',
      worldArchetype: 'high_fantasy',
      reincarnationMethod: 'truck_kun',
      cheatSkillId: 'cheat_appraisal_steal',
      initialStats: { str: 10, mag: 10, agi: 10, luk: 10 },
    };

    const result = await orchestrator.generateStartGame(payload);
    expect(result.model).toBe('fake-deterministic');
  });

  it('throws when all providers fail and fallback is disabled', async () => {
    const orchestrator = new AIOrchestrator({
      geminiApiKey: undefined,
      enableFakeFallback: false,
    });

    await expect(orchestrator.generateStartGame({
      characterName: 'X',
      language: 'en',
      worldArchetype: 'high_fantasy',
      reincarnationMethod: 'truck_kun',
      cheatSkillId: 'cheat_appraisal_steal',
      initialStats: { str: 10, mag: 10, agi: 10, luk: 10 },
    })).rejects.toThrow('No AI provider available');
  });

  it('FakeAIProvider generates a fallback turn result', async () => {
    const fakeProvider = new FakeAIProvider();
    const request: AIRequest<GameTurnResult> = {
      prompt: 'CONTINUE THE TURN. PLAYER ACTION TAKEN BY USER: "Go north"',
      promptVersion: '1.0.0',
    };

    const result = await fakeProvider.generateStructured<GameTurnResult>(request);
    expect(result.model).toBe('fake-deterministic');
    expect(result.data.narrative).toBeTruthy();
    expect(result.data.choices).toHaveLength(4);
    expect(result.data.isGameOver).toBe(false);
  });
});
