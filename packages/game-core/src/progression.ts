export const EXP_BASE = 100;
export const EXP_GROWTH_FACTOR = 1.5;
export const STAT_POINTS_PER_LEVEL = 3;
export const SKILL_POINTS_PER_LEVEL = 1;

export const BASE_MAX_HP = 100;
export const BASE_MAX_MP = 80;
export const HP_PER_STR = 2;
export const MP_PER_MAG = 2;

export function deriveMaxHp(str: number): number {
  return BASE_MAX_HP + str * HP_PER_STR;
}

export function deriveMaxMp(mag: number): number {
  return BASE_MAX_MP + mag * MP_PER_MAG;
}

export interface LevelUpResult {
  newLevel: number;
  newExp: number;
  newMaxExp: number;
  statPointsGained: number;
  skillPointsGained: number;
}

export function applyExperience(
  currentExp: number,
  currentLevel: number,
  currentMaxExp: number,
  expGained: number,
): LevelUpResult {
  let newExp = currentExp + expGained;
  let newLevel = currentLevel;
  let maxExp = currentMaxExp;
  let statPointsGained = 0;
  let skillPointsGained = 0;

  while (newExp >= maxExp) {
    newLevel += 1;
    newExp -= maxExp;
    maxExp = Math.floor(maxExp * EXP_GROWTH_FACTOR);
    statPointsGained += STAT_POINTS_PER_LEVEL;
    skillPointsGained += SKILL_POINTS_PER_LEVEL;
  }

  return { newLevel, newExp, newMaxExp: maxExp, statPointsGained, skillPointsGained };
}

export interface StatAllocationResult {
  stats: Record<string, number>;
  statPoints: number;
  maxHp?: number;
  maxMp?: number;
  hp?: number;
  mp?: number;
}

export function allocateStatPoint(
  stat: 'str' | 'mag' | 'agi' | 'luk',
  prevStats: Record<string, number>,
  statPoints: number,
  maxHp: number,
  maxMp: number,
  hp: number,
  mp: number,
): StatAllocationResult {
  if (statPoints <= 0) {
    return { stats: prevStats, statPoints, maxHp, maxMp, hp, mp };
  }

  const remainingPts = statPoints - 1;
  const newVal = (prevStats[stat] || 10) + 1;

  let newMaxHp = maxHp;
  let newMaxMp = maxMp;
  let newHp = hp;
  let newMp = mp;

  if (stat === 'str') {
    newMaxHp += HP_PER_STR;
    newHp += HP_PER_STR;
  } else if (stat === 'mag') {
    newMaxMp += MP_PER_MAG;
    newMp += MP_PER_MAG;
  }

  return {
    stats: { ...prevStats, [stat]: newVal },
    statPoints: remainingPts,
    maxHp: newMaxHp,
    maxMp: newMaxMp,
    hp: newHp,
    mp: newMp,
  };
}

export function calculateCompanionLevelUp(
  cExp: number,
  cLevel: number,
  cMaxExp: number,
): LevelUpResult {
  return applyExperience(cExp - cMaxExp, cLevel - 1, cMaxExp, cMaxExp * 2);
}

export function calculateCompanionExpGain(baseExp: number): number {
  return baseExp;
}
