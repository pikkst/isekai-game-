import type { GameTurnResult } from '@isekai/contracts';

export interface AIRequest<T> {
  prompt: string;
  schema?: unknown;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  validator?: (data: unknown) => T;
  promptVersion?: string;
}

export interface AIUsageMetadata {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costEstimate?: number;
}

export interface AIResponse<T> {
  data: T;
  usage?: AIUsageMetadata;
  model: string;
  promptVersion: string;
}

export type AIProviderName = 'gemini' | 'fake' | 'openai' | 'local' | 'none';

export interface AIProvider {
  readonly name: AIProviderName;
  readonly model: string;
  generateStructured<T>(request: AIRequest<T>): Promise<AIResponse<T>>;
}

export interface AIPromptConfig {
  promptId: string;
  promptVersion: string;
  schemaVersion: string;
  modelName: string;
  temperature: number;
  maxTokens?: number;
  timeoutMs: number;
  fallbackBehavior: 'use_deterministic' | 'throw';
  candidateModels: string[];
}

export const GAME_TURN_PROMPT_CONFIG: AIPromptConfig = {
  promptId: 'game_turn_generation',
   promptVersion: '1.0.0',
   schemaVersion: '1.0.0',
   modelName: 'gemini-3.6-flash',
   temperature: 0.8,
   maxTokens: 4096,
   timeoutMs: 30000,
   fallbackBehavior: 'use_deterministic',
   candidateModels: ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'],
};

export const START_GAME_PROMPT_CONFIG: AIPromptConfig = {
  promptId: 'start_game_generation',
  promptVersion: '1.0.0',
  schemaVersion: '1.0.0',
  modelName: 'gemini-3.6-flash',
  temperature: 0.8,
  maxTokens: 4096,
  timeoutMs: 30000,
  fallbackBehavior: 'use_deterministic',
  candidateModels: ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'],
};

export interface PromptContext {
  characterName: string;
  characterTitle: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  karma: number;
  fatePoints: number;
  str: number;
  mag: number;
  agi: number;
  luk: number;
  cheatSkillName: string;
  cheatSkillDescription: string;
  currentLocation: string;
  worldName: string;
  threatLevel: number;
  worldChaosLevel: number;
  worldEventSummary: string;
  turnCount: number;
  companionsContext: string;
  inventoryContext: string;
  memoriesContext: string;
  lastNarrative: string;
  playerAction: string;
  actionChoiceId?: string;
  worldArchetype: string;
  reincarnationMethod: string;
  customWorldPrompt?: string;
  customCheatPrompt?: string;
}

export type { GameTurnResult };
