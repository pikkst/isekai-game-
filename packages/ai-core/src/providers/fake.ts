import type { GameTurnResult, StartGamePayload } from '@isekai/contracts';
import { getFallbackPrologue, getFallbackTurn, type FallbackTurnContext } from '@isekai/game-core';
import type { AIProvider, AIRequest, AIResponse, AIProviderName } from '../types';

export class FakeAIProvider implements AIProvider {
  readonly name: AIProviderName = 'fake';
  readonly model: string = 'fake-deterministic';

  async generateStructured<T>(request: AIRequest<T>): Promise<AIResponse<T>> {
    const prompt = request.prompt.toLowerCase();

    if (prompt.includes('prologue') || prompt.includes('start')) {
      const payload = this.extractStartGamePayload(request.prompt);
      const result = getFallbackPrologue(payload) as unknown as T;
      return {
        data: result,
        model: this.model,
        promptVersion: request.promptVersion || '0.0.0',
      };
    }

    if (prompt.includes('player action') || prompt.includes('turn')) {
      const context = this.extractTurnContext(request.prompt);
      const result = getFallbackTurn(context) as unknown as T;
      return {
        data: result,
        model: this.model,
        promptVersion: request.promptVersion || '0.0.0',
      };
    }

    return {
      data: { narrative: 'The world awaits your decision.', location: 'Unknown Realm', choices: [], isGameOver: false } as T,
      model: this.model,
      promptVersion: request.promptVersion || '0.0.0',
    };
  }

  private extractStartGamePayload(prompt: string): StartGamePayload {
    const nameMatch = prompt.match(/Character Name:\s*(.+)/);
    const worldMatch = prompt.match(/World Archetype:\s*(.+)/);
    const reincarnationMatch = prompt.match(/Reincarnation Method:\s*(.+)/);
    const cheatMatch = prompt.match(/Cheat Skill Selected:\s*(\S+)/);
    const customCheatMatch = prompt.match(/Cheat Skill Selected:.*?\((\S[^)]*)\)/);
    const statsMatch = prompt.match(/STR:(\d+),\s*MAG:(\d+),\s*AGI:(\d+),\s*LUK:(\d+)/);

    return {
      characterName: nameMatch ? nameMatch[1].trim() : 'Hero',
      language: 'en',
      worldArchetype: (worldMatch ? worldMatch[1].trim() : 'high_fantasy') as StartGamePayload['worldArchetype'],
      customWorldPrompt: customCheatMatch ? customCheatMatch[1].trim() : undefined,
      reincarnationMethod: (reincarnationMatch ? reincarnationMatch[1].trim() : 'truck_kun') as StartGamePayload['reincarnationMethod'],
      cheatSkillId: cheatMatch ? cheatMatch[1].trim() : 'cheat_appraisal_steal',
      customCheatPrompt: customCheatMatch ? customCheatMatch[1].trim() : undefined,
      initialStats: {
        str: statsMatch ? parseInt(statsMatch[1], 10) : 10,
        mag: statsMatch ? parseInt(statsMatch[2], 10) : 10,
        agi: statsMatch ? parseInt(statsMatch[3], 10) : 10,
        luk: statsMatch ? parseInt(statsMatch[4], 10) : 10,
      },
    };
  }

  private extractTurnContext(prompt: string): FallbackTurnContext {
    const nameMatch = prompt.match(/Character:\s*(.+?)\s*\(/);
    const levelMatch = prompt.match(/Level:\s*(\d+)/);
    const hpMatch = prompt.match(/HP:\s*(\d+)\/(\d+)/);
    const mpMatch = prompt.match(/MP:\s*(\d+)\/(\d+)/);
    const karmaMatch = prompt.match(/Karma:\s*(-?\d+)/);
    const fateMatch = prompt.match(/Fate Points:\s*(\d+)/);
    const statsMatch = prompt.match(/Stats:\s*STR:(\d+),\s*MAG:(\d+),\s*AGI:(\d+),\s*LUK:(\d+)/);
    const locationMatch = prompt.match(/Current Location:\s*(.+)/);
    const worldMatch = prompt.match(/World Name\s*["'](.+?)["']/);
    const threatMatch = prompt.match(/Threat Level:\s*(\d+)/);
    const chaosMatch = prompt.match(/Chaos:\s*(\d+)/);
    const turnMatch = prompt.match(/Turn Count:\s*(\d+)/);
    const actionMatch = prompt.match(/PLAYER ACTION TAKEN BY USER:\s*"([^"]+)"/);
    const choiceIdMatch = prompt.match(/\(Choice ID:\s*(.+)\)/);

    return {
      choiceId: choiceIdMatch && choiceIdMatch[1] !== 'Custom Action' ? choiceIdMatch[1].trim() : undefined,
      choiceText: undefined,
      customActionText: actionMatch ? actionMatch[1].trim() : undefined,
       stats: {
        name: nameMatch ? nameMatch[1].trim() : 'Hero',
        title: '',
        level: levelMatch ? parseInt(levelMatch[1], 10) : 1,
        exp: 0,
        maxExp: 100,
        hp: hpMatch ? parseInt(hpMatch[1], 10) : 100,
        maxHp: hpMatch ? parseInt(hpMatch[2], 10) : 100,
        mp: mpMatch ? parseInt(mpMatch[1], 10) : 80,
        maxMp: mpMatch ? parseInt(mpMatch[2], 10) : 80,
        karma: karmaMatch ? parseInt(karmaMatch[1], 10) : 0,
        fatePoints: fateMatch ? parseInt(fateMatch[1], 10) : 0,
        str: statsMatch ? parseInt(statsMatch[1], 10) : 10,
        mag: statsMatch ? parseInt(statsMatch[2], 10) : 10,
        agi: statsMatch ? parseInt(statsMatch[3], 10) : 10,
        luk: statsMatch ? parseInt(statsMatch[4], 10) : 10,
      },
      world: {
        worldName: worldMatch ? worldMatch[1].trim() : 'Aetheria',
        threatLevel: threatMatch ? parseInt(threatMatch[1], 10) : 10,
        worldChaosLevel: chaosMatch ? parseInt(chaosMatch[1], 10) : 5,
        worldEventSummary: 'The world rests in an uneasy calm.',
        factionStandings: {},
      },
      companions: [],
      turnCount: turnMatch ? parseInt(turnMatch[1], 10) : 0,
    } as FallbackTurnContext;
  }
}

export type { GameTurnResult };
