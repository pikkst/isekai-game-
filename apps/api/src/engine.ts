import type {
  StartGameRequest,
  TurnActionRequest,
  GameTurnResult,
  GameStateSnapshot,
  CharacterStats,
  WorldState,
  InventoryItem,
  Skill,
  Companion,
  CheatSkill,
  StoryMemory,
  Equipment,
} from '@isekai/contracts';
import type { PlayerActionInput, BuildPromptContextInput } from '@isekai/ai-core';
import { enrichTurnResultWithImages } from '@isekai/contracts';
import {
  validateGameTurnResult,
  createInitialStats,
  findCheatSkillById,
  generateStarterItems,
  generateStarterSkills,
  generateStarterCompanion,
  generatePrologueMemory,
  applyInventoryChanges,
} from '@isekai/game-core';
import { AIOrchestrator } from '@isekai/ai-core';
import { WORLD_PRESETS } from '@isekai/contracts';
import type { SessionRecord } from './sessionStore';

export interface StartGameResponse {
  sessionId: string;
  turnResult: GameTurnResult;
  initialState: GameStateSnapshot;
}

export interface TurnResponse {
  turnResult: GameTurnResult;
  updatedState: GameStateSnapshot;
}

export class GameEngine {
  private aiOrchestrator: AIOrchestrator;

  constructor(deps?: { geminiApiKey?: string }) {
    this.aiOrchestrator = new AIOrchestrator({
      geminiApiKey: deps?.geminiApiKey,
      enableFakeFallback: true,
    });
  }

  private getWorldName(archetype: string, language: 'et' | 'en'): string {
    const preset = WORLD_PRESETS.find((p) => p.id === archetype);
    if (preset) {
      return preset.defaultWorldName[language];
    }
    return language === 'et' ? 'Päraldmatu Maailm' : 'Uncharted Cosmos';
  }

  private buildInitialState(request: StartGameRequest): GameStateSnapshot {
    const stats = createInitialStats(request);
    const language: 'et' | 'en' = request.language;

    const world: WorldState = {
      worldName: this.getWorldName(request.worldArchetype, language),
      threatLevel: 25,
      worldChaosLevel: 15,
      factionStandings: { 'Royal Capital': 50 },
      worldEventSummary: language === 'et'
        ? 'Demondiimon on edasiminekul põhja. Kuningasriik otsib Heldurit.'
        : 'The Demon Army advances north. The Kingdom is searching for a Hero.',
    };

    const inventory: InventoryItem[] = generateStarterItems();
    const skills: Skill[] = generateStarterSkills().map((s) => ({
      ...s,
      isCheat: false,
    }));

    const companion = generateStarterCompanion();
    const companions: Companion[] = [companion];

    const cheatSkill: CheatSkill = request.cheatSkillId
      ? (() => {
          const preset = findCheatSkillById(request.cheatSkillId, request.customCheatPrompt);
          return preset;
        })()
      : { id: 'custom', name: request.customCheatPrompt || 'Custom Divine Cheat', description: request.customCheatPrompt || 'Unfathomable cheat powers.', cooldown: 0, type: 'divine' };

    const equipment: Equipment = {};

    return {
      stats,
      world,
      inventory,
      skills,
      companions,
      equipment,
      turnCount: 0,
      lastLocation: world.worldName,
      lastNarrative: '',
      cheatSkill,
    };
  }

  async startGame(request: StartGameRequest, sessionId: string): Promise<StartGameResponse> {
    const initialState = this.buildInitialState(request);

    const aiResponse = await this.aiOrchestrator.generateStartGame(request);
    const turnResult = enrichTurnResultWithImages(aiResponse.data);

    return {
      sessionId,
      turnResult,
      initialState,
    };
  }

  async processTurn(
    record: SessionRecord,
    action: TurnActionRequest['action'],
  ): Promise<{ turnResult: GameTurnResult; updatedState: GameStateSnapshot }> {
    const { state } = record;

    const playerAction: PlayerActionInput = this.mapAction(action);

    const promptContextInput: BuildPromptContextInput = {
      stats: state.stats,
      world: state.world,
      inventory: state.inventory,
      companions: state.companions,
      turnCount: state.turnCount,
      lastLocation: state.lastLocation,
      lastNarrative: state.lastNarrative,
      cheatSkill: state.cheatSkill,
      memoryLogs: state.memoryLogs,
      worldArchetype: record.worldArchetype,
      reincarnationMethod: record.reincarnationMethod,
      customWorldPrompt: record.customWorldPrompt,
      customCheatPrompt: record.customCheatPrompt,
    };

    const aiResponse = await this.aiOrchestrator.generateTurnAction(promptContextInput, playerAction);
    let turnResult = aiResponse.data;

    if (aiResponse.model !== 'deterministic-fallback' && aiResponse.model !== 'fake') {
      const validated = validateGameTurnResult(
        turnResult,
        state.stats,
        state.world,
      );

      const updatedStats = { ...state.stats };
      for (const [key, value] of Object.entries(validated.stats)) {
        (updatedStats as Record<string, unknown>)[key] = value;
      }

      const updatedWorld = { ...state.world };
      for (const [key, value] of Object.entries(validated.world)) {
        (updatedWorld as Record<string, unknown>)[key] = value;
      }

      turnResult = {
        ...turnResult,
        statChanges: validated.stats,
        worldChanges: validated.world,
      };

      state.stats = updatedStats;
      state.world = updatedWorld;
    }

    if (turnResult.newItems) {
      const inventoryChanges = turnResult.newItems.map((ni) => ({
        action: ni.action,
        item: ni.item,
      }));
      state.inventory = applyInventoryChanges(state.inventory, inventoryChanges);
    }

    if (turnResult.newSkills) {
      const newSkillIds = new Set(state.skills.map((s) => s.id));
      const newSkills = turnResult.newSkills.filter((s) => !newSkillIds.has(s.id));
      state.skills = [...state.skills, ...newSkills];
    }

    if (turnResult.partyChanges && turnResult.partyChanges.length > 0) {
      const existingIds = new Set(state.companions.map((c) => c.id));
      const updated = [...state.companions];
      for (const comp of turnResult.partyChanges) {
        const idx = updated.findIndex((c) => c.id === comp.id);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], ...comp };
        } else {
          updated.push(comp);
        }
      }
      state.companions = updated;
    }

    if (turnResult.newMemories) {
      state.memoryLogs = [...(turnResult.newMemories || []), ...(state.memoryLogs || [])];
    }

    state.turnCount = state.turnCount + 1;
    state.lastNarrative = turnResult.narrative;
    state.lastLocation = turnResult.location;

    const enriched = enrichTurnResultWithImages(turnResult);

    return {
      turnResult: enriched,
      updatedState: { ...state },
    };
  }

  private mapAction(action: TurnActionRequest['action']): PlayerActionInput {
    switch (action.type) {
      case 'choice':
        return { choiceId: action.choiceId };
      case 'custom':
        return { customActionText: action.text };
      case 'reroll':
        return {};
      default:
        return {};
    }
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
