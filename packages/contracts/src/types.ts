export type Language = 'et' | 'en';

export type WorldArchetype =
  | 'high_fantasy'
  | 'cyberpunk_cultivation'
  | 'dark_demon_lord'
  | 'otome_academy'
  | 'post_apocalyptic'
  | 'custom';

export type ReincarnationMethod =
  | 'truck_kun'
  | 'goddess_summon'
  | 'reborn_as_monster'
  | 'vrmmo_trapped'
  | 'god_mistake'
  | 'custom';

export interface CheatSkill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  type: 'offensive' | 'utility' | 'divine' | 'stealth' | 'passive';
  icon?: string;
  imageUrl?: string;
}

export interface CharacterStats {
  name: string;
  title: string;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  str: number;
  mag: number;
  agi: number;
  luk: number;
  statPoints?: number;
  skillPoints?: number;
  karma: number;
  fatePoints: number;
  avatarUrl?: string;
}

export interface Equipment {
  weapon?: string;
  armor?: string;
  accessory?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'potion' | 'weapon' | 'armor' | 'artifact' | 'key';
  effect?: string;
  count: number;
  imageUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  isCheat?: boolean;
  imageUrl?: string;
  treeBranch?: 'might' | 'magic' | 'shadow' | 'divine';
  unlocked?: boolean;
  requiredLevel?: number;
  costPoints?: number;
  statBonus?: { str?: number; mag?: number; agi?: number; luk?: number };
}

export interface StoryMemory {
  id: string;
  turnNumber: number;
  title: string;
  description: string;
  category: 'romance' | 'battle' | 'secret' | 'vow' | 'tragedy';
  relatedCompanionId?: string;
}

export interface Companion {
  id: string;
  name: string;
  role: string;
  loyalty: number;
  affection?: number;
  romanceStatus?: 'Ally' | 'Companion' | 'Close Confidante' | 'Beloved' | 'Sworn Soulmate' | 'Harem Empress';
  status: string;
  avatarIcon?: string;
  avatarUrl?: string;
  level?: number;
  exp?: number;
  maxExp?: number;
  str?: number;
  mag?: number;
  agi?: number;
  ability?: string;
  personality?: string;
  specialMemories?: string[];
  favoriteGift?: string;
}

export interface WorldState {
  worldName: string;
  threatLevel: number;
  worldChaosLevel: number;
  factionStandings: Record<string, number>;
  worldEventSummary: string;
}

export interface GameTurnChoice {
  id: string;
  text: string;
  type: 'combat' | 'diplomacy' | 'stealth' | 'cheat' | 'fate' | 'exploration';
  risk: 'safe' | 'moderate' | 'high' | 'extreme';
}

export interface CombatInfo {
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  battleLog: string;
}

export interface GameTurnResult {
  narrative: string;
  location: string;
  statChanges?: Partial<CharacterStats>;
  worldChanges?: Partial<WorldState>;
  newItems?: Array<{ item: InventoryItem; action: 'add' | 'remove' }>;
  newSkills?: Skill[];
  partyChanges?: Companion[];
  newMemories?: StoryMemory[];
  choices: GameTurnChoice[];
  isGameOver: boolean;
  gameEndType?: 'victory' | 'defeat' | 'ascension' | 'peaceful' | null;
  combatInfo?: CombatInfo | null;
  imagePrompt?: string;
  sceneImageUrl?: string;
  audioMood?: 'fantasy' | 'battle' | 'mystic' | 'dark' | 'triumph' | 'tranquil';
}

export interface TimelineNode {
  turnNumber: number;
  narrativeSnippet: string;
  choiceMade: string;
  location: string;
  karmaAtTurn: number;
  statsAtTurn: {
    level: number;
    hp: number;
    mp: number;
  };
}

export interface HallOfFameRecord {
  id: string;
  characterName: string;
  title: string;
  worldName: string;
  archetype: string;
  endingType: string;
  turnsSurvived: number;
  finalLevel: number;
  summary: string;
  timestamp: string;
  avatarUrl?: string;
}

export interface StartGamePayload {
  characterName: string;
  language: Language;
  worldArchetype: WorldArchetype;
  customWorldPrompt?: string;
  reincarnationMethod: ReincarnationMethod;
  cheatSkillId: string;
  customCheatPrompt?: string;
  initialStats: {
    str: number;
    mag: number;
    agi: number;
    luk: number;
  };
}

export interface GameStateSnapshot {
  stats: CharacterStats;
  world: WorldState;
  inventory: InventoryItem[];
  skills: Skill[];
  companions: Companion[];
  equipment: Equipment;
  turnCount: number;
  lastLocation: string;
  lastNarrative: string;
  cheatSkill: CheatSkill;
  memoryLogs?: StoryMemory[];
}

export interface TurnActionPayload {
  choiceId?: string;
  choiceText?: string;
  customActionText?: string;
  language: Language;
  gameState: GameStateSnapshot;
}

export interface ClientGameState {
  stats: CharacterStats;
  world: WorldState;
  inventory: InventoryItem[];
  skills: Skill[];
  companions: Companion[];
  equipment: Equipment;
  turnCount: number;
  lastLocation: string;
  lastNarrative: string;
  cheatSkill: CheatSkill;
  memoryLogs?: StoryMemory[];
}

export interface StartGameRequest {
  sessionId?: string;
  idempotencyKey: string;
  characterName: string;
  language: Language;
  worldArchetype: WorldArchetype;
  customWorldPrompt?: string;
  reincarnationMethod: ReincarnationMethod;
  cheatSkillId: string;
  customCheatPrompt?: string;
  initialStats: {
    str: number;
    mag: number;
    agi: number;
    luk: number;
  };
}

export interface TurnActionRequest {
  sessionId: string;
  idempotencyKey: string;
  action:
    | { type: 'choice'; choiceId: string }
    | { type: 'custom'; text: string }
    | { type: 'reroll' };
}

export enum ApiErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  requestId: string;
}
