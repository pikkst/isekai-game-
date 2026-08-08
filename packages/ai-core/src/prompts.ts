import type { StartGamePayload, CharacterStats, WorldState, Companion, InventoryItem, StoryMemory, CheatSkill } from '@isekai/contracts';
import type { AIRequest, PromptContext } from './types';
import { START_GAME_PROMPT_CONFIG } from './types';

export function buildStartGamePrompt(payload: StartGamePayload): string {
  return `You are a master Isekai RPG Game Master running an immersive, interactive Isekai story game.
Language: ALWAYS respond 100% in English.
Character Name: ${payload.characterName}
World Archetype: ${payload.worldArchetype}
Custom World Description: ${payload.customWorldPrompt || 'None'}
Reincarnation Method: ${payload.reincarnationMethod}
Cheat Skill Selected: ${payload.cheatSkillId} (${payload.customCheatPrompt || 'Standard Cheat'})
Initial Stats: STR:${payload.initialStats.str}, MAG:${payload.initialStats.mag}, AGI:${payload.initialStats.agi}, LUK:${payload.initialStats.luk}

Instructions:
1. Write an epic, captivating prologue introducing the rebirth/summoning scene.
2. Establish the location, the discovery of the player's stats/cheat skill, and the immediate world situation.
3. Provide 4 distinct choice options for the player (1 combat/action, 1 clever/diplomatic, 1 using cheat skill, 1 fate/exploratory).
4. Return valid structured JSON conforming strictly to the response schema in 100% English.
`;
}

export function buildStartGameRequest(payload: StartGamePayload): AIRequest<unknown> {
  return {
    prompt: buildStartGamePrompt(payload),
    modelName: START_GAME_PROMPT_CONFIG.candidateModels[0],
    temperature: START_GAME_PROMPT_CONFIG.temperature,
    maxTokens: START_GAME_PROMPT_CONFIG.maxTokens,
    timeoutMs: START_GAME_PROMPT_CONFIG.timeoutMs,
    promptVersion: START_GAME_PROMPT_CONFIG.promptVersion,
  };
}

export function buildTurnActionPrompt(context: PromptContext): string {
  return `You are an expert Isekai RPG Story Master running an immersive fantasy/sci-fi visual novel RPG.
Language: ALWAYS respond 100% in English.

CURRENT GAME STATE:
Character: ${context.characterName} (Title: ${context.characterTitle}, Level: ${context.level}, HP: ${context.hp}/${context.maxHp}, MP: ${context.mp}/${context.maxMp}, Karma: ${context.karma}, Fate Points: ${context.fatePoints})
Stats: STR:${context.str}, MAG:${context.mag}, AGI:${context.agi}, LUK:${context.luk}
Cheat Skill: ${context.cheatSkillName} - ${context.cheatSkillDescription}
Current Location: ${context.currentLocation}
World State: World Name "${context.worldName}", Threat Level: ${context.threatLevel}/100, Chaos: ${context.worldChaosLevel}/100.
Party / Harem Companions: ${context.companionsContext}
Inventory: ${context.inventoryContext}
Turn Count: ${context.turnCount}

STORY MEMORIES & HISTORIC ARC LOGS:
${context.memoriesContext}

PREVIOUS SCENE:
${context.lastNarrative}

PLAYER ACTION TAKEN BY USER:
"${context.playerAction}"
(Choice ID: ${context.actionChoiceId || 'Custom Action'})

RULES & INSTRUCTIONS:
1. Continue the story organically specifically responding to and resolving the player's action "${context.playerAction}" in 100% English.
2. STORYTELLING & ROMANCE/HAREM DYNAMICS: Write vivid, captivating narrative prose with character dialogue, emotional depth, and realistic consequences. If companions are present, show their affectionate reactions, romantic dialogue, or battle assistance based on their romance status!
3. MEMORY CONTINUITY: Reference past key decisions or story memories listed above to make the narrative feel continuous and deeply personalized.
4. CHEAT SKILL / MIRACLE: If the player used a Cheat Skill or Miracle, describe an overwhelming or spectacular outcome, but advance the main questline or raise higher-tier threats.
5. GAME OVER / ASCENSION: If HP drops to 0, set isGameOver = true with gameEndType = 'defeat'. If Demon King is defeated, set isGameOver = true with gameEndType = 'victory' or 'ascension'.
6. Provide 4 exciting, contextually relevant new choices for the player (1 combat, 1 diplomatic/romantic, 1 cheat skill usage, 1 exploratory/risky fate).
7. Return JSON strictly formatted to response schema in 100% English.
`;
}

export interface BuildPromptContextInput {
  stats: CharacterStats;
  world: WorldState;
  inventory: InventoryItem[];
  companions: Companion[];
  turnCount: number;
  lastLocation: string;
  lastNarrative: string;
  cheatSkill: CheatSkill;
  memoryLogs?: StoryMemory[];
  worldArchetype?: string;
  reincarnationMethod?: string;
  customWorldPrompt?: string;
  customCheatPrompt?: string;
}

export interface PlayerActionInput {
  choiceId?: string;
  choiceText?: string;
  customActionText?: string;
}

export function buildPromptContext(
  gameState: BuildPromptContextInput,
  playerAction: PlayerActionInput,
): PromptContext {
  const companionsContext =
    gameState.companions.length > 0
      ? gameState.companions
          .map((c) => `${c.name} (Role: ${c.role}, Loyalty: ${c.loyalty}%, Affection/Romance: ${c.affection || 50}%, Status: ${c.romanceStatus || 'Ally'})`)
          .join('; ')
      : 'No companions in party currently.';

  const inventoryContext = gameState.inventory.map((i) => i.name).join(', ') || 'Empty';

  const memoriesContext = gameState.memoryLogs
    ? gameState.memoryLogs.map((m) => `[Turn ${m.turnNumber}] ${m.title}: ${m.description}`).join(' | ')
    : 'No key story memories logged yet.';

  return {
    characterName: gameState.stats.name,
    characterTitle: gameState.stats.title,
    level: gameState.stats.level,
    hp: gameState.stats.hp,
    maxHp: gameState.stats.maxHp,
    mp: gameState.stats.mp,
    maxMp: gameState.stats.maxMp,
    karma: gameState.stats.karma,
    fatePoints: gameState.stats.fatePoints,
    str: gameState.stats.str,
    mag: gameState.stats.mag,
    agi: gameState.stats.agi,
    luk: gameState.stats.luk,
    cheatSkillName: gameState.cheatSkill.name,
    cheatSkillDescription: gameState.cheatSkill.description,
    currentLocation: gameState.lastLocation,
    worldName: gameState.world.worldName,
    threatLevel: gameState.world.threatLevel,
    worldChaosLevel: gameState.world.worldChaosLevel,
    worldEventSummary: gameState.world.worldEventSummary,
    turnCount: gameState.turnCount,
    companionsContext,
    inventoryContext,
    memoriesContext,
    lastNarrative: gameState.lastNarrative,
    playerAction: playerAction.customActionText || playerAction.choiceText || 'Selected option choice',
    actionChoiceId: playerAction.choiceId,
    worldArchetype: gameState.worldArchetype || 'custom',
    reincarnationMethod: gameState.reincarnationMethod || 'custom',
    customWorldPrompt: gameState.customWorldPrompt,
    customCheatPrompt: gameState.customCheatPrompt,
  };
}
