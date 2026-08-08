export interface RNG {
  next(): number;
  shuffle<T>(array: T[]): T[];
  intInRange(min: number, max: number): number;
  float(): number;
}

export function createSeededRNG(seed: number): RNG {
  let state = seed >>> 0;

  const next = (): number => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const shuffle = <T>(array: T[]): T[] => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const intInRange = (min: number, max: number): number => {
    return Math.floor(next() * (max - min + 1)) + min;
  };

  return { next, shuffle, intInRange, float: next };
}

export class MathRNG implements RNG {
  next(): number {
    return Math.random();
  }
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  intInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  float(): number {
    return Math.random();
  }
}
