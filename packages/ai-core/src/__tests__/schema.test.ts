import { describe, it, expect } from 'vitest';
import { validateGameTurnResult } from '../schema';
import type { GameTurnResult } from '@isekai/contracts';

describe('ai-core schema validation', () => {
  describe('validateGameTurnResult', () => {
    it('validates a well-formed response', () => {
      const data = {
        narrative: 'A grand adventure begins.',
        location: 'Ancient Forest',
        choices: [{ id: 'c1', text: 'Go north', type: 'exploration', risk: 'safe' }],
        isGameOver: false,
      };

      const result = validateGameTurnResult(data);
      expect(result.narrative).toBe('A grand adventure begins.');
      expect(result.location).toBe('Ancient Forest');
      expect(result.choices).toHaveLength(1);
      expect(result.isGameOver).toBe(false);
    });

    it('throws on missing required field', () => {
      const data = {
        location: 'Forest',
        choices: [],
        isGameOver: false,
      };

      expect(() => validateGameTurnResult(data)).toThrow('schema validation');
    });

    it('throws on null input', () => {
      expect(() => validateGameTurnResult(null)).toThrow();
    });

    it('throws on non-object input', () => {
      expect(() => validateGameTurnResult('not an object')).toThrow();
      expect(() => validateGameTurnResult(42)).toThrow();
    });

    it('throws on invalid nested item type', () => {
      const data = {
        narrative: 'test',
        location: 'test',
        newItems: [
          {
            action: 'add',
            item: { id: 'i1', name: 'X', description: 'd', type: 'invalid', count: 1 },
          },
        ],
        choices: [],
        isGameOver: false,
      };

      expect(() => validateGameTurnResult(data)).toThrow('schema validation');
    });

    it('throws on invalid choice type', () => {
      const data = {
        narrative: 'test',
        location: 'test',
        choices: [{ id: 'c1', text: 'x', type: 'invalid', risk: 'safe' }],
        isGameOver: false,
      };

      expect(() => validateGameTurnResult(data)).toThrow('schema validation');
    });

    it('throws on invalid audioMood', () => {
      const data = {
        narrative: 'test',
        location: 'test',
        audioMood: 'aggressive',
        choices: [],
        isGameOver: false,
      };

      expect(() => validateGameTurnResult(data)).toThrow('schema validation');
    });

    it('accepts valid optional fields', () => {
      const data = {
        narrative: 'The hero arrives.',
        location: 'Sanctum',
        statChanges: { hp: 100, level: 1 },
        worldChanges: { threatLevel: 25 },
        newItems: [
          {
            action: 'add',
            item: { id: 'i1', name: 'Sword', description: 'Blade', type: 'weapon', count: 1 },
          },
        ],
        newSkills: [{ id: 's1', name: 'Slash', description: 'Strike', mpCost: 5, isCheat: false }],
        partyChanges: [{ id: 'p1', name: 'Aria', role: 'Guide', loyalty: 80, status: 'Happy' }],
        newMemories: [{ id: 'm1', turnNumber: 1, title: 'Start', description: 'Began', category: 'vow' }],
        choices: [{ id: 'c1', text: 'Go north', type: 'exploration', risk: 'safe' }],
        isGameOver: false,
        gameEndType: null,
        combatInfo: { enemyName: 'Goblin', enemyHp: 30, enemyMaxHp: 30, battleLog: 'A fight!' },
        imagePrompt: 'A fantasy scene',
        sceneImageUrl: 'https://example.com/img.png',
        audioMood: 'mystic',
      };

      const result = validateGameTurnResult(data);
      expect(result.narrative).toBe('The hero arrives.');
      expect(result.combatInfo?.enemyName).toBe('Goblin');
      expect(result.sceneImageUrl).toBe('https://example.com/img.png');
      expect(result.audioMood).toBe('mystic');
    });
  });
});
