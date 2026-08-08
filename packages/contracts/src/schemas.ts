import { z } from 'zod';

export const LanguageSchema = z.enum(['et', 'en']);
export const WorldArchetypeSchema = z.enum([
  'high_fantasy',
  'cyberpunk_cultivation',
  'dark_demon_lord',
  'otome_academy',
  'post_apocalyptic',
  'custom',
]);
export const ReincarnationMethodSchema = z.enum([
  'truck_kun',
  'goddess_summon',
  'reborn_as_monster',
  'vrmmo_trapped',
  'god_mistake',
  'custom',
]);

export const StatBonusSchema = z.object({
  str: z.number().optional(),
  mag: z.number().optional(),
  agi: z.number().optional(),
  luk: z.number().optional(),
});

export const InitialStatsSchema = z.object({
  str: z.number().int().min(1),
  mag: z.number().int().min(1),
  agi: z.number().int().min(1),
  luk: z.number().int().min(1),
});

export const StartGamePayloadSchema = z.object({
  characterName: z.string().min(1).max(100),
  language: LanguageSchema,
  worldArchetype: WorldArchetypeSchema,
  customWorldPrompt: z.string().optional(),
  reincarnationMethod: ReincarnationMethodSchema,
  cheatSkillId: z.string().min(1),
  customCheatPrompt: z.string().optional(),
  initialStats: InitialStatsSchema,
});

export const CharacterStatsSchema = z.object({
  name: z.string(),
  title: z.string(),
  level: z.number().int().min(0),
  exp: z.number().int().min(0),
  maxExp: z.number().int().min(0),
  hp: z.number().int().min(0),
  maxHp: z.number().int().min(0),
  mp: z.number().int().min(0),
  maxMp: z.number().int().min(0),
  str: z.number().int().min(0),
  mag: z.number().int().min(0),
  agi: z.number().int().min(0),
  luk: z.number().int().min(0),
  statPoints: z.number().int().min(0).optional(),
  skillPoints: z.number().int().min(0).optional(),
  karma: z.number().int().min(-100).max(100),
  fatePoints: z.number().int().min(0),
  avatarUrl: z.string().url().optional(),
});

export const WorldStateSchema = z.object({
  worldName: z.string(),
  threatLevel: z.number().int().min(0).max(100),
  worldChaosLevel: z.number().int().min(0).max(100),
  factionStandings: z.record(z.string(), z.number()),
  worldEventSummary: z.string(),
});

export const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['potion', 'weapon', 'armor', 'artifact', 'key']),
  effect: z.string().optional(),
  count: z.number().int().min(0),
  imageUrl: z.string().url().optional(),
});

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  mpCost: z.number().int().min(0),
  isCheat: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
  treeBranch: z.enum(['might', 'magic', 'shadow', 'divine']).optional(),
  unlocked: z.boolean().optional(),
  requiredLevel: z.number().int().min(0).optional(),
  costPoints: z.number().int().min(0).optional(),
  statBonus: StatBonusSchema.optional(),
});

export const StoryMemorySchema = z.object({
  id: z.string(),
  turnNumber: z.number().int().min(0),
  title: z.string(),
  description: z.string(),
  category: z.enum(['romance', 'battle', 'secret', 'vow', 'tragedy']),
  relatedCompanionId: z.string().optional(),
});

export const CompanionSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  loyalty: z.number().int().min(0).max(100),
  affection: z.number().int().min(0).max(100).optional(),
  romanceStatus: z
    .enum(['Ally', 'Companion', 'Close Confidante', 'Beloved', 'Sworn Soulmate', 'Harem Empress'])
    .optional(),
  status: z.string(),
  avatarIcon: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  level: z.number().int().min(0).optional(),
  exp: z.number().int().min(0).optional(),
  maxExp: z.number().int().min(0).optional(),
  str: z.number().int().min(0).optional(),
  mag: z.number().int().min(0).optional(),
  agi: z.number().int().min(0).optional(),
  ability: z.string().optional(),
  personality: z.string().optional(),
  specialMemories: z.array(z.string()).optional(),
  favoriteGift: z.string().optional(),
});

export const GameTurnChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(['combat', 'diplomacy', 'stealth', 'cheat', 'fate', 'exploration']),
  risk: z.enum(['safe', 'moderate', 'high', 'extreme']),
});

export const CombatInfoSchema = z.object({
  enemyName: z.string(),
  enemyHp: z.number().int().min(0),
  enemyMaxHp: z.number().int().min(0),
  battleLog: z.string(),
});

export const StatChangesSchema = CharacterStatsSchema.partial();

export const WorldChangesSchema = WorldStateSchema.partial();

export const NewItemSchema = z.object({
  action: z.enum(['add', 'remove']),
  item: InventoryItemSchema,
});

export const GameTurnResultSchema = z.object({
  narrative: z.string(),
  location: z.string(),
  statChanges: z.record(z.string(), z.unknown()).optional(),
  worldChanges: z.record(z.string(), z.unknown()).optional(),
  newItems: z.array(NewItemSchema).optional(),
  newSkills: z.array(SkillSchema).optional(),
  partyChanges: z.array(CompanionSchema).optional(),
  newMemories: z.array(StoryMemorySchema).optional(),
  choices: z.array(GameTurnChoiceSchema),
  isGameOver: z.boolean(),
  gameEndType: z.enum(['victory', 'defeat', 'ascension', 'peaceful']).nullable().optional(),
  combatInfo: CombatInfoSchema.nullable().optional(),
  imagePrompt: z.string().optional(),
  sceneImageUrl: z.string().url().optional(),
  audioMood: z.enum(['fantasy', 'battle', 'mystic', 'dark', 'triumph', 'tranquil']).optional(),
});

export const TimelineNodeSchema = z.object({
  turnNumber: z.number().int().min(0),
  narrativeSnippet: z.string(),
  choiceMade: z.string(),
  location: z.string(),
  karmaAtTurn: z.number().int(),
  statsAtTurn: z.object({
    level: z.number().int().min(0),
    hp: z.number().int().min(0),
    mp: z.number().int().min(0),
  }),
});

export const HallOfFameRecordSchema = z.object({
  id: z.string(),
  characterName: z.string(),
  title: z.string(),
  worldName: z.string(),
  archetype: z.string(),
  endingType: z.string(),
  turnsSurvived: z.number().int().min(0),
  finalLevel: z.number().int().min(0),
  summary: z.string(),
  timestamp: z.string(),
  avatarUrl: z.string().url().optional(),
});

export const EquipmentSchema = z.object({
  weapon: z.string().optional(),
  armor: z.string().optional(),
  accessory: z.string().optional(),
});

export const GameStateSnapshotSchema = z.object({
  stats: CharacterStatsSchema,
  world: WorldStateSchema,
  inventory: z.array(InventoryItemSchema),
  skills: z.array(SkillSchema),
  companions: z.array(CompanionSchema),
  equipment: EquipmentSchema,
  turnCount: z.number().int().min(0),
  lastLocation: z.string(),
  lastNarrative: z.string(),
  cheatSkill: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    cooldown: z.number().int().min(0),
    type: z.enum(['offensive', 'utility', 'divine', 'stealth', 'passive']),
    icon: z.string().optional(),
    imageUrl: z.string().url().optional(),
  }),
  memoryLogs: z.array(StoryMemorySchema).optional(),
});

export const TurnActionPayloadSchema = z.object({
  choiceId: z.string().optional(),
  choiceText: z.string().optional(),
  customActionText: z.string().optional(),
  language: LanguageSchema,
  gameState: GameStateSnapshotSchema,
});

export const StartGameRequestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  idempotencyKey: z.string().uuid(),
  characterName: z.string().min(1).max(100),
  language: LanguageSchema,
  worldArchetype: WorldArchetypeSchema,
  customWorldPrompt: z.string().optional(),
  reincarnationMethod: ReincarnationMethodSchema,
  cheatSkillId: z.string().min(1),
  customCheatPrompt: z.string().optional(),
  initialStats: InitialStatsSchema,
});

export const ChoiceActionSchema = z.object({
  type: z.literal('choice'),
  choiceId: z.string(),
});

export const CustomActionSchema = z.object({
  type: z.literal('custom'),
  text: z.string().min(1).max(500),
});

export const RerollActionSchema = z.object({
  type: z.literal('reroll'),
});

export const TurnActionRequestSchema = z.object({
  sessionId: z.string().uuid(),
  idempotencyKey: z.string().uuid(),
  action: z.discriminatedUnion('type', [ChoiceActionSchema, CustomActionSchema, RerollActionSchema]),
});
