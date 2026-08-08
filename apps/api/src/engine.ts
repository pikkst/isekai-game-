import type { StartGamePayload, TurnActionPayload, GameTurnResult } from '@isekai/contracts';
import { enrichTurnResultWithImages } from '@isekai/contracts';
import { validateGameTurnResult } from '@isekai/game-core';
import { AIOrchestrator } from '@isekai/ai-core';

export class GameEngine {
  private aiOrchestrator: AIOrchestrator;

  constructor(deps?: { geminiApiKey?: string }) {
    this.aiOrchestrator = new AIOrchestrator({
      geminiApiKey: deps?.geminiApiKey,
      enableFakeFallback: true,
    });
  }

  async processStartGame(payload: StartGamePayload): Promise<GameTurnResult> {
    const aiResponse = await this.aiOrchestrator.generateStartGame(payload);
    return enrichTurnResultWithImages(aiResponse.data);
  }

  async processTurnAction(payload: TurnActionPayload): Promise<GameTurnResult> {
    const gameState = payload.gameState;

    const aiResponse = await this.aiOrchestrator.generateTurnAction(
      {
        stats: gameState.stats,
        world: gameState.world,
        inventory: gameState.inventory,
        companions: gameState.companions,
        turnCount: gameState.turnCount,
        lastLocation: gameState.lastLocation,
        lastNarrative: gameState.lastNarrative,
        cheatSkill: gameState.cheatSkill,
        memoryLogs: gameState.memoryLogs,
      },
      {
        choiceId: payload.choiceId,
        choiceText: payload.choiceText,
        customActionText: payload.customActionText,
      },
    );

    let result = aiResponse.data;

    if (aiResponse.model !== 'deterministic-fallback') {
      const validated = validateGameTurnResult(
        result,
        gameState.stats,
        gameState.world,
      );

      result = {
        ...result,
        statChanges: validated.stats,
        worldChanges: {
          ...validated.world,
        },
      };
    }

    return enrichTurnResultWithImages(result);
  }

  getAIProviderName(): string {
    return this.aiOrchestrator.getProviderName();
  }

  isAIAvailable(): boolean {
    return this.aiOrchestrator.isAIAvailable();
  }
}

export const gameEngine = new GameEngine({
  geminiApiKey: process.env.GEMINI_API_KEY,
});
