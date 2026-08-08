import { Type } from '@google/genai';
import type { GameTurnResult, InventoryItem } from '@isekai/contracts';

export const gameTurnResponseSchema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: 'The story continuation in rich descriptive style in English.',
    },
    location: {
      type: Type.STRING,
      description: 'Current location or scene name in English.',
    },
    audioMood: {
      type: Type.STRING,
      description: 'Atmospheric audio mood: fantasy, battle, mystic, dark, triumph, or tranquil.',
    },
    statChanges: {
      type: Type.OBJECT,
      description: 'Updates to stats if any (e.g. hp change, exp gained, karma change).',
      properties: {
        hp: { type: Type.INTEGER },
        maxHp: { type: Type.INTEGER },
        mp: { type: Type.INTEGER },
        maxMp: { type: Type.INTEGER },
        str: { type: Type.INTEGER },
        mag: { type: Type.INTEGER },
        agi: { type: Type.INTEGER },
        luk: { type: Type.INTEGER },
        level: { type: Type.INTEGER },
        exp: { type: Type.INTEGER },
        maxExp: { type: Type.INTEGER },
        karma: { type: Type.INTEGER },
        fatePoints: { type: Type.INTEGER },
      },
    },
    worldChanges: {
      type: Type.OBJECT,
      description: 'World status changes.',
      properties: {
        worldName: { type: Type.STRING },
        threatLevel: { type: Type.INTEGER },
        worldChaosLevel: { type: Type.INTEGER },
        worldEventSummary: { type: Type.STRING },
      },
    },
    newItems: {
      type: Type.ARRAY,
      description: 'Items acquired or removed.',
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, description: 'add or remove' },
          item: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING },
              effect: { type: Type.STRING },
              count: { type: Type.INTEGER },
            },
            required: ['id', 'name', 'description', 'type', 'count'],
          },
        },
        required: ['action', 'item'],
      },
    },
    newSkills: {
      type: Type.ARRAY,
      description: 'New skills unlocked.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          mpCost: { type: Type.INTEGER },
          isCheat: { type: Type.BOOLEAN },
        },
        required: ['id', 'name', 'description', 'mpCost'],
      },
    },
    partyChanges: {
      type: Type.ARRAY,
      description: 'Updated companions or new allies joined.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          loyalty: { type: Type.INTEGER },
          status: { type: Type.STRING },
        },
        required: ['id', 'name', 'role', 'loyalty', 'status'],
      },
    },
    choices: {
      type: Type.ARRAY,
      description: '4 exciting choice options for the player.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          type: { type: Type.STRING, description: 'combat, diplomacy, stealth, cheat, fate, or exploration' },
          risk: { type: Type.STRING, description: 'safe, moderate, high, or extreme' },
        },
        required: ['id', 'text', 'type', 'risk'],
      },
    },
    isGameOver: { type: Type.BOOLEAN },
    gameEndType: { type: Type.STRING, description: 'victory, defeat, ascension, peaceful or null' },
    combatInfo: {
      type: Type.OBJECT,
      properties: {
        enemyName: { type: Type.STRING },
        enemyHp: { type: Type.INTEGER },
        enemyMaxHp: { type: Type.INTEGER },
        battleLog: { type: Type.STRING },
      },
    },
    imagePrompt: { type: Type.STRING, description: 'Visual description of scene for artwork generator.' },
  },
  required: ['narrative', 'location', 'choices', 'isGameOver'],
};

export type SchemaValidator = (data: unknown) => GameTurnResult;

export function validateGameTurnResult(data: unknown): GameTurnResult {
  if (typeof data !== 'object' || data === null) {
    throw new Error('AI response is not an object');
  }
  const result = data as Record<string, unknown>;
  const turn: Partial<GameTurnResult> = {};

  if (typeof result.narrative === 'string') turn.narrative = result.narrative;
  else throw new Error('Missing or invalid narrative');

  if (typeof result.location === 'string') turn.location = result.location;
  else throw new Error('Missing or invalid location');

  if (Array.isArray(result.choices)) {
    turn.choices = result.choices.map((c) => {
      if (typeof c !== 'object' || c === null) throw new Error('Invalid choice item');
      const choice = c as Record<string, unknown>;
      return {
        id: typeof choice.id === 'string' ? choice.id : '',
        text: typeof choice.text === 'string' ? choice.text : '',
        type: (typeof choice.type === 'string' ? choice.type : 'exploration') as GameTurnResult['choices'][number]['type'],
        risk: (typeof choice.risk === 'string' ? choice.risk : 'safe') as GameTurnResult['choices'][number]['risk'],
      };
    });
  } else {
    throw new Error('Missing or invalid choices array');
  }

  if (typeof result.isGameOver === 'boolean') turn.isGameOver = result.isGameOver;
  else throw new Error('Missing or invalid isGameOver');

  if (result.statChanges && typeof result.statChanges === 'object') {
    turn.statChanges = result.statChanges as unknown as Partial<Record<string, number | undefined>>;
  }
  if (result.worldChanges && typeof result.worldChanges === 'object') {
    turn.worldChanges = result.worldChanges as unknown as Partial<Record<string, unknown>>;
  }
  if (Array.isArray(result.newItems)) {
    turn.newItems = result.newItems.map((ni) => {
      if (typeof ni !== 'object' || ni === null) throw new Error('Invalid newItems entry');
      return ni as unknown as { item: InventoryItem; action: 'add' | 'remove' };
    });
  }
  if (Array.isArray(result.newSkills)) {
    turn.newSkills = result.newSkills as GameTurnResult['newSkills'];
  }
  if (Array.isArray(result.partyChanges)) {
    turn.partyChanges = result.partyChanges as GameTurnResult['partyChanges'];
  }
  if (Array.isArray(result.newMemories)) {
    turn.newMemories = result.newMemories as GameTurnResult['newMemories'];
  }
  if (typeof result.gameEndType === 'string') {
    turn.gameEndType = result.gameEndType as GameTurnResult['gameEndType'];
  }
  if (result.combatInfo && typeof result.combatInfo === 'object') {
    turn.combatInfo = result.combatInfo as GameTurnResult['combatInfo'];
  }
  if (typeof result.imagePrompt === 'string') turn.imagePrompt = result.imagePrompt;
  if (typeof result.audioMood === 'string') turn.audioMood = result.audioMood as GameTurnResult['audioMood'];

  return turn as GameTurnResult;
}
