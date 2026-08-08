import { describe, it, expect } from 'vitest';
import { applyExperience, allocateStatPoint, deriveMaxHp, deriveMaxMp } from '../progression';

describe('progression', () => {
  describe('applyExperience', () => {
    it('returns same level when exp is below threshold', () => {
      const result = applyExperience(30, 1, 100, 50);
      expect(result.newLevel).toBe(1);
      expect(result.newExp).toBe(80);
      expect(result.newMaxExp).toBe(100);
      expect(result.statPointsGained).toBe(0);
      expect(result.skillPointsGained).toBe(0);
    });

    it('levels up when exp reaches threshold', () => {
      const result = applyExperience(80, 1, 100, 30);
      expect(result.newLevel).toBe(2);
      expect(result.newExp).toBe(10);
      expect(result.newMaxExp).toBe(150);
      expect(result.statPointsGained).toBe(3);
      expect(result.skillPointsGained).toBe(1);
    });

    it('levels up multiple times', () => {
      const result = applyExperience(0, 1, 100, 300);
      expect(result.newLevel).toBe(3);
      expect(result.statPointsGained).toBe(6);
      expect(result.skillPointsGained).toBe(2);
    });

    it('handles zero exp gain', () => {
      const result = applyExperience(50, 1, 100, 0);
      expect(result.newLevel).toBe(1);
      expect(result.newExp).toBe(50);
      expect(result.statPointsGained).toBe(0);
    });
  });

  describe('allocateStatPoint', () => {
    it('increases stat and reduces points', () => {
      const result = allocateStatPoint('str', { str: 10, mag: 10, agi: 10, luk: 10 }, 5, 120, 80, 120, 80);
      expect(result.stats.str).toBe(11);
      expect(result.statPoints).toBe(4);
      expect(result.maxHp).toBe(122);
      expect(result.hp).toBe(122);
    });

    it('increases magic stat and MP', () => {
      const result = allocateStatPoint('mag', { str: 10, mag: 10, agi: 10, luk: 10 }, 5, 120, 80, 120, 80);
      expect(result.stats.mag).toBe(11);
      expect(result.maxMp).toBe(82);
      expect(result.mp).toBe(82);
    });

    it('returns unchanged when no stat points', () => {
      const result = allocateStatPoint('str', { str: 10, mag: 10, agi: 10, luk: 10 }, 0, 120, 80, 120, 80);
      expect(result.stats.str).toBe(10);
      expect(result.statPoints).toBe(0);
    });
  });

  describe('deriveMaxHp', () => {
    it('calculates max HP from strength', () => {
      expect(deriveMaxHp(10)).toBe(120);
      expect(deriveMaxHp(20)).toBe(140);
    });
  });

  describe('deriveMaxMp', () => {
    it('calculates max MP from magic', () => {
      expect(deriveMaxMp(10)).toBe(100);
      expect(deriveMaxMp(20)).toBe(120);
    });
  });
});
