import { describe, it, expect } from 'vitest';
import {
  validateStatChange,
  validateStatChanges,
  validateWorldChanges,
  validateGameTurnResult,
} from '../validators';
import type { CharacterStats, WorldState, GameTurnResult } from '@isekai/contracts';

const mockStats: CharacterStats = {
  name: 'Hero',
  title: 'Test',
  level: 1,
  exp: 10,
  maxExp: 100,
  hp: 50,
  maxHp: 100,
  mp: 40,
  maxMp: 80,
  str: 10,
  mag: 10,
  agi: 10,
  luk: 10,
  karma: 0,
  fatePoints: 0,
};

const mockWorld: WorldState = {
  worldName: 'TestWorld',
  threatLevel: 50,
  worldChaosLevel: 25,
  factionStandings: { faction1: 50 },
  worldEventSummary: 'A test event',
};

describe('validators', () => {
  describe('validateStatChange', () => {
    it('clamps to min', () => {
      expect(validateStatChange(-10, 0, 100)).toBe(0);
    });

    it('clamps to max', () => {
      expect(validateStatChange(150, 0, 100)).toBe(100);
    });

    it('returns value within range', () => {
      expect(validateStatChange(50, 0, 100)).toBe(50);
    });
  });

  describe('validateStatChanges', () => {
    it('clamps HP to max HP', () => {
      const result = validateStatChanges({ hp: 200, level: 5 }, mockStats);
      expect(result.hp).toBe(100);
      expect(result.level).toBe(5);
    });

    it('floors integer values', () => {
      const result = validateStatChanges({ str: 10.7, mag: 15.3 }, mockStats);
      expect(result.str).toBe(10);
      expect(result.mag).toBe(15);
    });

    it('clamps karma to [-100, 100]', () => {
      expect(validateStatChanges({ karma: -200 }, mockStats).karma).toBe(-100);
      expect(validateStatChanges({ karma: 200 }, mockStats).karma).toBe(100);
    });

    it('returns empty object for undefined changes', () => {
      expect(validateStatChanges(undefined, mockStats)).toEqual({});
    });

    it('clamps level to minimum 1', () => {
      expect(validateStatChanges({ level: 0 }, mockStats).level).toBe(1);
    });

    it('clamps maxHp and maxMp to minimum 1', () => {
      const result = validateStatChanges({ maxHp: 0, maxMp: -5 }, mockStats);
      expect(result.maxHp).toBe(1);
      expect(result.maxMp).toBe(1);
    });
  });

  describe('validateWorldChanges', () => {
    it('clamps threatLevel to [0, 100]', () => {
      expect(validateWorldChanges({ threatLevel: 150 }, mockWorld).threatLevel).toBe(100);
      expect(validateWorldChanges({ threatLevel: -10 }, mockWorld).threatLevel).toBe(0);
    });

    it('clamps worldChaosLevel to [0, 100]', () => {
      expect(validateWorldChanges({ worldChaosLevel: -5 }, mockWorld).worldChaosLevel).toBe(0);
      expect(validateWorldChanges({ worldChaosLevel: 110 }, mockWorld).worldChaosLevel).toBe(100);
    });

    it('passes through worldName string', () => {
      const result = validateWorldChanges({ worldName: 'NewWorld' }, mockWorld);
      expect(result.worldName).toBe('NewWorld');
    });

    it('returns empty for undefined', () => {
      expect(validateWorldChanges(undefined, mockWorld)).toEqual({});
    });
  });

  describe('validateGameTurnResult', () => {
    it('validates a well-formed turn result', () => {
      const result: GameTurnResult = {
        narrative: 'A grand adventure begins.',
        location: 'Forest',
        choices: [
          { id: 'c1', text: 'Go north', type: 'exploration', risk: 'safe' },
        ],
        isGameOver: false,
        statChanges: { hp: 80, level: 2 },
        worldChanges: { threatLevel: 30 },
        newItems: [{ action: 'add', item: { id: 'i1', name: 'Sword', description: 'A blade', type: 'weapon', count: 1 } }],
        newSkills: [{ id: 's1', name: 'Slash', description: 'Strike', mpCost: 5 }],
        partyChanges: [{ id: 'p1', name: 'Aria', role: 'Guide', loyalty: 80, status: 'Happy' }],
        newMemories: [{ id: 'm1', turnNumber: 1, title: 'Start', description: 'Began journey', category: 'vow' }],
      };

      const validated = validateGameTurnResult(result, mockStats, mockWorld);
      expect(validated.stats.hp).toBe(80);
      expect(validated.stats.level).toBe(2);
      expect(validated.world.threatLevel).toBe(30);
      expect(validated.items[0].itemId).toBe('i1');
      expect(validated.skills[0]).toBe('s1');
      expect(validated.companions[0].name).toBe('Aria');
      expect(validated.memories[0].title).toBe('Start');
      expect(validated.choices[0].id).toBe('c1');
    });

    it('clamps invalid stat values', () => {
      const result: GameTurnResult = {
        narrative: 'test',
        location: 'test',
        choices: [{ id: 'c1', text: 'x', type: 'exploration', risk: 'safe' }],
        isGameOver: false,
        statChanges: { hp: -50, karma: 1000 },
      };

      const validated = validateGameTurnResult(result, mockStats, mockWorld);
      expect(validated.stats.hp).toBe(0);
      expect(validated.stats.karma).toBe(100);
    });

    it('handles empty optional arrays', () => {
      const result: GameTurnResult = {
        narrative: 'test',
        location: 'test',
        choices: [{ id: 'c1', text: 'x', type: 'exploration', risk: 'safe' }],
        isGameOver: false,
      };

      const validated = validateGameTurnResult(result, mockStats, mockWorld);
      expect(validated.items).toEqual([]);
      expect(validated.skills).toEqual([]);
      expect(validated.companions).toEqual([]);
      expect(validated.memories).toEqual([]);
    });
  });
});
