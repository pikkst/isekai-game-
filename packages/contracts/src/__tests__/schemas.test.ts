import { describe, it, expect } from 'vitest';
import { GameTurnResultSchema } from '../schemas';

describe('contracts schemas', () => {
  describe('GameTurnResultSchema', () => {
    it('validates a well-formed turn result', () => {
      const data = {
        narrative: 'A grand adventure begins.',
        location: 'Ancient Forest',
        statChanges: { hp: 80, level: 2 },
        worldChanges: { threatLevel: 30 },
        newItems: [
          {
            action: 'add',
            item: { id: 'i1', name: 'Sword', description: 'A blade', type: 'weapon', count: 1 },
          },
        ],
        newSkills: [{ id: 's1', name: 'Slash', description: 'Strike', mpCost: 5 }],
        partyChanges: [{ id: 'p1', name: 'Aria', role: 'Guide', loyalty: 80, status: 'Happy' }],
        newMemories: [{ id: 'm1', turnNumber: 1, title: 'Start', description: 'Began', category: 'vow' }],
        choices: [{ id: 'c1', text: 'Go north', type: 'exploration', risk: 'safe' }],
        isGameOver: false,
      };

      const result = GameTurnResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const data = {
        location: 'Forest',
      };
      const result = GameTurnResultSchema.safeParse(data);
      expect(result.success).toBe(false);
      expect(result.error!.issues.some((i) => i.path.includes('narrative'))).toBe(true);
      expect(result.error!.issues.some((i) => i.path.includes('isGameOver'))).toBe(true);
      expect(result.error!.issues.some((i) => i.path.includes('choices'))).toBe(true);
    });

    it('rejects non-string narrative', () => {
      const data = {
        narrative: 123,
        location: 'Forest',
        choices: [],
        isGameOver: false,
      };
      const result = GameTurnResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects non-array choices', () => {
      const data = {
        narrative: 'test',
        location: 'test',
        choices: 'not-an-array',
        isGameOver: false,
      };
      const result = GameTurnResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid item type enum', () => {
      const data = {
        narrative: 'test',
        location: 'test',
        newItems: [
          {
            action: 'add',
            item: { id: 'i1', name: 'X', description: 'd', type: 'invalid_type', count: 1 },
          },
        ],
        choices: [],
        isGameOver: false,
      };
      const result = GameTurnResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects invalid gameEndType', () => {
      const data = {
        narrative: 'test',
        location: 'test',
        choices: [],
        isGameOver: true,
        gameEndType: 'invalid',
      };
      const result = GameTurnResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('accepts null gameEndType', () => {
      const data = {
        narrative: 'test',
        location: 'test',
        choices: [],
        isGameOver: true,
        gameEndType: null,
      };
      const result = GameTurnResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects choices with invalid type enum', () => {
      const data = {
        narrative: 'test',
        location: 'test',
        choices: [{ id: 'c1', text: 'x', type: 'invalid_type', risk: 'safe' }],
        isGameOver: false,
      };
      const result = GameTurnResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('rejects choices with invalid risk enum', () => {
      const data = {
        narrative: 'test',
        location: 'test',
        choices: [{ id: 'c1', text: 'x', type: 'exploration', risk: 'extreme_risk' }],
        isGameOver: false,
      };
      const result = GameTurnResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('statChanges accepts any values (domain validator handles value checking)', () => {
      const data = {
        narrative: 'test',
        location: 'test',
        statChanges: { hp: 'not-a-number' },
        choices: [],
        isGameOver: false,
      };
      const result = GameTurnResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects non-boolean isGameOver', () => {
      const data = {
        narrative: 'test',
        location: 'test',
        choices: [],
        isGameOver: 'yes',
      };
      const result = GameTurnResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
