import { GameTurnResultSchema } from '@isekai/contracts';
import type { GameTurnResult } from '@isekai/contracts';

export interface AISchemaProperty {
  type: string;
  description?: string;
  required?: string[];
  items?: AISchemaProperty;
  properties?: Record<string, AISchemaProperty>;
  enum?: string[];
}

export interface AISchemaDefinition {
  type: string;
  properties: Record<string, AISchemaProperty>;
  required: string[];
  description?: string;
}

export const gameTurnResponseSchema: AISchemaDefinition = {
  type: 'object',
  properties: {
    narrative: {
      type: 'string',
      description: 'The story continuation in rich descriptive style in English.',
    },
    location: {
      type: 'string',
      description: 'Current location or scene name in English.',
    },
    audioMood: {
      type: 'string',
      description: 'Atmospheric audio mood: fantasy, battle, mystic, dark, triumph, or tranquil.',
      enum: ['fantasy', 'battle', 'mystic', 'dark', 'triumph', 'tranquil'],
    },
    statChanges: {
      type: 'object',
      description: 'Updates to stats if any (e.g. hp change, exp gained, karma change).',
      properties: {
        hp: { type: 'integer' },
        maxHp: { type: 'integer' },
        mp: { type: 'integer' },
        maxMp: { type: 'integer' },
        str: { type: 'integer' },
        mag: { type: 'integer' },
        agi: { type: 'integer' },
        luk: { type: 'integer' },
        level: { type: 'integer' },
        exp: { type: 'integer' },
        maxExp: { type: 'integer' },
        karma: { type: 'integer' },
        fatePoints: { type: 'integer' },
      },
    },
    worldChanges: {
      type: 'object',
      description: 'World status changes.',
      properties: {
        worldName: { type: 'string' },
        threatLevel: { type: 'integer' },
        worldChaosLevel: { type: 'integer' },
        worldEventSummary: { type: 'string' },
      },
    },
    newItems: {
      type: 'array',
      description: 'Items acquired or removed.',
      items: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['add', 'remove'] },
          item: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              type: { type: 'string', enum: ['potion', 'weapon', 'armor', 'artifact', 'key'] },
              effect: { type: 'string' },
              count: { type: 'integer' },
            },
            required: ['id', 'name', 'description', 'type', 'count'],
          },
        },
        required: ['action', 'item'],
      },
    },
    newSkills: {
      type: 'array',
      description: 'New skills unlocked.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          mpCost: { type: 'integer' },
          isCheat: { type: 'boolean' },
        },
        required: ['id', 'name', 'description', 'mpCost'],
      },
    },
    partyChanges: {
      type: 'array',
      description: 'Updated companions or new allies joined.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string' },
          loyalty: { type: 'integer' },
          status: { type: 'string' },
        },
        required: ['id', 'name', 'role', 'loyalty', 'status'],
      },
    },
    choices: {
      type: 'array',
      description: '4 exciting choice options for the player.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
          type: { type: 'string', enum: ['combat', 'diplomacy', 'stealth', 'cheat', 'fate', 'exploration'] },
          risk: { type: 'string', enum: ['safe', 'moderate', 'high', 'extreme'] },
        },
        required: ['id', 'text', 'type', 'risk'],
      },
    },
    isGameOver: { type: 'boolean' },
    gameEndType: {
      type: 'string',
      description: 'victory, defeat, ascension, peaceful or null',
      enum: ['victory', 'defeat', 'ascension', 'peaceful'],
    },
    combatInfo: {
      type: 'object',
      properties: {
        enemyName: { type: 'string' },
        enemyHp: { type: 'integer' },
        enemyMaxHp: { type: 'integer' },
        battleLog: { type: 'string' },
      },
    },
    imagePrompt: { type: 'string', description: 'Visual description of scene for artwork generator.' },
  },
  required: ['narrative', 'location', 'choices', 'isGameOver'],
};

export type SchemaValidator = (data: unknown) => GameTurnResult;

export function validateGameTurnResult(data: unknown): GameTurnResult {
  const parseResult = GameTurnResultSchema.safeParse(data);
  if (!parseResult.success) {
    throw new Error(
      `AI response failed schema validation: ${parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`,
    );
  }
  return parseResult.data as unknown as GameTurnResult;
}
