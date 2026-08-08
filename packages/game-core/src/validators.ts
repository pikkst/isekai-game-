import type {
  CharacterStats,
  Companion,
  GameTurnResult,
  WorldState,
} from '@isekai/contracts';

export interface ValidatedTurnResult {
  stats: Partial<CharacterStats>;
  world: Partial<WorldState>;
  items: Array<{ action: 'add' | 'remove'; itemId: string; count: number }>;
  skills: string[];
  companions: Companion[];
  memories: Array<{ id: string; turnNumber: number; title: string; description: string; category: string }>;
  isGameOver: boolean;
  gameEndType: 'victory' | 'defeat' | 'ascension' | 'peaceful' | null;
  choices: Array<{ id: string; text: string; type: string; risk: string }>;
  narrative: string;
  location: string;
  combatInfo?: { enemyName: string; enemyHp: number; enemyMaxHp: number; battleLog: string };
  audioMood?: string;
  imagePrompt?: string;
}

export function validateStatChange(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function validateStatChanges(
  changes: Partial<CharacterStats> | undefined,
  currentStats: CharacterStats,
): Partial<CharacterStats> {
  if (!changes) return {};

  const validated: Partial<CharacterStats> = {};

  if (changes.hp !== undefined) {
    validated.hp = validateStatChange(changes.hp, 0, currentStats.maxHp);
  }
  if (changes.maxHp !== undefined) {
    validated.maxHp = Math.max(1, Math.floor(changes.maxHp));
  }
  if (changes.mp !== undefined) {
    validated.mp = validateStatChange(changes.mp, 0, currentStats.maxMp);
  }
  if (changes.maxMp !== undefined) {
    validated.maxMp = Math.max(1, Math.floor(changes.maxMp));
  }
  if (changes.str !== undefined) validated.str = Math.max(0, Math.floor(changes.str));
  if (changes.mag !== undefined) validated.mag = Math.max(0, Math.floor(changes.mag));
  if (changes.agi !== undefined) validated.agi = Math.max(0, Math.floor(changes.agi));
  if (changes.luk !== undefined) validated.luk = Math.max(0, Math.floor(changes.luk));
  if (changes.level !== undefined) validated.level = Math.max(1, Math.floor(changes.level));
  if (changes.exp !== undefined) validated.exp = Math.max(0, Math.floor(changes.exp));
  if (changes.maxExp !== undefined) validated.maxExp = Math.max(1, Math.floor(changes.maxExp));
  if (changes.karma !== undefined) {
    validated.karma = validateStatChange(changes.karma, -100, 100);
  }
  if (changes.fatePoints !== undefined) validated.fatePoints = Math.max(0, Math.floor(changes.fatePoints));
  if (changes.statPoints !== undefined) validated.statPoints = Math.max(0, Math.floor(changes.statPoints));
  if (changes.skillPoints !== undefined) validated.skillPoints = Math.max(0, Math.floor(changes.skillPoints));

  return validated;
}

export function validateWorldChanges(
  changes: Partial<WorldState> | undefined,
  currentWorld: WorldState,
): Partial<WorldState> {
  if (!changes) return {};

  const validated: Partial<WorldState> = {};

  if (changes.threatLevel !== undefined) {
    validated.threatLevel = Math.max(0, Math.min(100, Math.floor(changes.threatLevel)));
  }
  if (changes.worldChaosLevel !== undefined) {
    validated.worldChaosLevel = Math.max(0, Math.min(100, Math.floor(changes.worldChaosLevel)));
  }
  if (changes.worldName !== undefined) {
    validated.worldName = changes.worldName;
  }
  if (changes.worldEventSummary !== undefined) {
    validated.worldEventSummary = changes.worldEventSummary;
  }
  if (changes.factionStandings !== undefined) {
    validated.factionStandings = changes.factionStandings;
  }

  return validated;
}

export function validateGameTurnResult(
  result: GameTurnResult,
  currentStats: CharacterStats,
  currentWorld: WorldState,
): ValidatedTurnResult {
  const validatedStats = validateStatChanges(result.statChanges, currentStats);
  const validatedWorld = validateWorldChanges(result.worldChanges, currentWorld);

  return {
    stats: validatedStats,
    world: validatedWorld,
    items: (result.newItems || []).map((ni) => ({
      action: ni.action,
      itemId: ni.item.id,
      count: ni.item.count,
    })),
    skills: (result.newSkills || []).map((s) => s.id),
    companions: result.partyChanges || [],
    memories: (result.newMemories || []).map((m) => ({
      id: m.id,
      turnNumber: m.turnNumber,
      title: m.title,
      description: m.description,
      category: m.category,
    })),
    isGameOver: result.isGameOver,
    gameEndType: result.gameEndType || null,
    choices: result.choices.map((c) => ({
      id: c.id,
      text: c.text,
      type: c.type,
      risk: c.risk,
    })),
    narrative: result.narrative,
    location: result.location,
    combatInfo: result.combatInfo
      ? {
          enemyName: result.combatInfo.enemyName,
          enemyHp: Math.max(0, Math.floor(result.combatInfo.enemyHp)),
          enemyMaxHp: Math.max(1, Math.floor(result.combatInfo.enemyMaxHp)),
          battleLog: result.combatInfo.battleLog,
        }
      : undefined,
    audioMood: result.audioMood,
    imagePrompt: result.imagePrompt,
  };
}
