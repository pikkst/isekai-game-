import type { GameTurnResult, StartGamePayload } from '@isekai/contracts';
import { getFallbackPrologue, getFallbackTurn, type FallbackTurnContext } from '@isekai/game-core';
import { gameTurnResponseSchema, validateGameTurnResult } from './schema';
import { buildStartGamePrompt, buildTurnActionPrompt, buildPromptContext, type BuildPromptContextInput, type PlayerActionInput } from './prompts';
import type { AIProvider, AIRequest, AIResponse, AIProviderName } from './types';
import { GAME_TURN_PROMPT_CONFIG, START_GAME_PROMPT_CONFIG } from './types';
import { GeminiAdapter } from './providers/gemini';
import { FakeAIProvider } from './providers/fake';

export interface AIOrchestratorDeps {
  geminiApiKey?: string;
  enableFakeFallback?: boolean;
}

export class AIOrchestrator {
  private providers: AIProvider[];
  readonly fallbackToDeterministic: boolean;

  constructor(deps?: AIOrchestratorDeps) {
    this.fallbackToDeterministic = deps?.enableFakeFallback ?? true;

    this.providers = [];

    const gemini = new GeminiAdapter({ apiKey: deps?.geminiApiKey });
    if (gemini.isAvailable()) {
      this.providers.push(gemini);
    }

    if (this.fallbackToDeterministic) {
      this.providers.push(new FakeAIProvider());
    }
  }

  getProviderName(): AIProviderName {
    return this.providers.length > 0 ? this.providers[0].name : 'none';
  }

  isAIAvailable(): boolean {
    return this.providers.some((p) => p.name === 'gemini');
  }

  async generateStartGame(payload: StartGamePayload): Promise<AIResponse<GameTurnResult>> {
    const request: AIRequest<GameTurnResult> = {
      prompt: buildStartGamePrompt(payload),
      modelName: START_GAME_PROMPT_CONFIG.candidateModels[0],
      temperature: START_GAME_PROMPT_CONFIG.temperature,
      maxTokens: START_GAME_PROMPT_CONFIG.maxTokens,
      timeoutMs: START_GAME_PROMPT_CONFIG.timeoutMs,
      promptVersion: START_GAME_PROMPT_CONFIG.promptVersion,
      schema: gameTurnResponseSchema,
      validator: validateGameTurnResult,
    };

    for (const provider of this.providers) {
      try {
        return await provider.generateStructured<GameTurnResult>(request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`AI provider ${provider.name} failed for startGame:`, message);
        if (provider.name === 'gemini' && this.fallbackToDeterministic) {
          continue;
        }
      }
    }

    if (this.fallbackToDeterministic) {
      return {
        data: getFallbackPrologue(payload),
        model: 'deterministic-fallback',
        promptVersion: START_GAME_PROMPT_CONFIG.promptVersion,
      };
    }

    throw new Error('No AI provider available and deterministic fallback disabled');
  }

  async generateTurnAction(
    gameState: BuildPromptContextInput,
    playerAction: PlayerActionInput,
  ): Promise<AIResponse<GameTurnResult>> {
    const promptContext = buildPromptContext(gameState, playerAction);
    const prompt = buildTurnActionPrompt(promptContext);

    const request: AIRequest<GameTurnResult> = {
      prompt,
      schema: gameTurnResponseSchema,
      validator: validateGameTurnResult,
      promptVersion: GAME_TURN_PROMPT_CONFIG.promptVersion,
      temperature: GAME_TURN_PROMPT_CONFIG.temperature,
      maxTokens: GAME_TURN_PROMPT_CONFIG.maxTokens,
      timeoutMs: GAME_TURN_PROMPT_CONFIG.timeoutMs,
    };

    for (const provider of this.providers) {
      try {
        return await provider.generateStructured<GameTurnResult>(request);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`AI provider ${provider.name} failed for turnAction:`, message);
      }
    }

    if (this.fallbackToDeterministic) {
      const fallbackContext: FallbackTurnContext = {
        choiceId: playerAction.choiceId,
        choiceText: playerAction.choiceText,
        customActionText: playerAction.customActionText,
        stats: gameState.stats,
        world: gameState.world,
        companions: gameState.companions,
        turnCount: gameState.turnCount,
      };

      return {
        data: getFallbackTurn(fallbackContext),
        model: 'deterministic-fallback',
        promptVersion: GAME_TURN_PROMPT_CONFIG.promptVersion,
      };
    }

    throw new Error('No AI provider available and deterministic fallback disabled');
  }
}
