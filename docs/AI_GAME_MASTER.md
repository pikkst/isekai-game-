# AI Game Master

## 1. Purpose

The AI Game Master (AI GM) turns deterministic game facts into immersive narrative, dialogue, scene direction and bounded future choices.

It is not the game engine and it is not the database authority.

The AI GM must improve:
- personalization;
- replayability;
- dialogue quality;
- narrative continuity;
- scene variety;
- pacing;
- emotional impact.

It must never be allowed to silently invent permanent mechanical state.

## 2. Core Rule

**The engine decides what happened. The AI decides how it feels and how it is described.**

Example:

Engine facts:

```json
{
  "attackHit": true,
  "critical": true,
  "damage": 43,
  "enemyHpAfter": 0,
  "enemyDefeated": true,
  "lootGranted": ["item_moonfang"]
}
```

AI GM may narrate a spectacular finishing blow, but cannot change damage to 500, resurrect the enemy, or grant an unrelated legendary weapon.

## 3. Provider Abstraction

Define a project-owned provider interface.

Conceptual example:

```ts
export interface AIProvider {
  generateStructured<T>(request: StructuredAIRequest<T>): Promise<StructuredAIResponse<T>>;
}
```

Provider adapters may include:
- Gemini;
- OpenAI;
- local OpenAI-compatible endpoint;
- deterministic fake provider for tests.

Application/domain code must not depend directly on provider SDK types.

## 4. Provider Capabilities

The abstraction should track capabilities such as:
- structured JSON output;
- streaming;
- tool/function calling;
- maximum context size;
- image generation or multimodal input later;
- usage reporting;
- safety/refusal metadata.

Do not assume every model supports every capability.

## 5. Model Configuration

Model IDs belong in validated configuration, not scattered through gameplay code.

Example:

```text
AI_PROVIDER=gemini
AI_NARRATIVE_MODEL=...
AI_SUMMARY_MODEL=...
AI_TIMEOUT_MS=30000
```

Support a controlled fallback list.

Never make the game dependent on one hard-coded model name that may disappear.

## 6. Prompt Registry

Prompts are versioned application assets.

Each prompt definition should include:
- prompt ID;
- version;
- role/purpose;
- required input schema;
- required output schema;
- model capability requirements;
- maximum context policy;
- safety constraints;
- generation settings;
- fallback strategy.

Example IDs:
- `turn-narrative/v1`;
- `npc-dialogue/v1`;
- `memory-summary/v1`;
- `encounter-flavor/v1`;
- `ending-narrative/v1`.

Store the prompt version used for each generated turn.

## 7. Structured Turn Output

A turn narrative response should be structured.

Conceptual shape:

```ts
interface NarrativeTurnResult {
  narrative: string;
  locationDisplayName?: string;
  dialogue?: DialogueBeat[];
  scene: ScenePresentation;
  choices: NarrativeChoice[];
  memoriesSuggested?: MemorySuggestion[];
  toneTags?: string[];
}
```

Important: these choices are candidate narrative options. The backend validates them against available mechanics before exposing them.

## 8. Context Builder

The context builder must deliberately select information.

Never send the complete database record or unlimited transcript.

Recommended context layers:

### Layer 1 — Current resolved facts

Always highest priority.

Examples:
- action taken;
- check result;
- combat result;
- item consumed;
- quest transition;
- reputation change.

### Layer 2 — Current scene

- current location;
- active encounter;
- present NPCs;
- weather/time if relevant;
- immediate objective.

### Layer 3 — Character summary

Only narratively relevant information:
- name/title;
- level/power tier;
- defining skills;
- cheat skill;
- karma/alignment summary;
- notable conditions.

### Layer 4 — Active quests

Include only quests relevant to the current scene or action.

### Layer 5 — Companion context

Include present companions and relevant relationship memories.

### Layer 6 — Recent turns

Use compact summaries, not full transcript.

### Layer 7 — Long-term memories

Retrieve a small number of important/relevant memories.

### Layer 8 — World facts

Include only facts relevant to the scene.

## 9. Memory Types

Recommended categories:
- battle;
- relationship;
- vow;
- betrayal;
- secret;
- discovery;
- faction;
- quest;
- tragedy;
- achievement;
- world event.

Each memory should support:
- subject entity IDs;
- importance score;
- turn number;
- short factual summary;
- tags;
- optional expiration/relevance policy.

## 10. Memory Creation

Do not persist every generated sentence as long-term memory.

Memory candidates may come from:
- deterministic domain events;
- AI suggestions;
- quest milestones;
- relationship milestones;
- major world-state changes.

A deterministic validator decides what is stored.

## 11. Narrative Director

The Narrative Director sits above individual turn wording.

It maintains compact campaign guidance such as:
- current act;
- current arc;
- main unresolved objective;
- tension score;
- current mystery hooks;
- active antagonist;
- recent content mix;
- target next beat.

Example content mix tracking:

```text
last 5 scenes:
combat: 2
social: 1
exploration: 2
```

The director can suggest a social or revelation scene next instead of another random battle.

## 12. Choice Generation

AI-generated choices must be bounded.

A choice should include:
- stable generated choice ID;
- player-facing text;
- intent/category;
- risk indication where useful;
- optional referenced entity/action.

Backend validation checks:
- referenced skill/item exists;
- resource is available;
- location/action is legal;
- choice does not contain an impossible permanent reward;
- hidden/system instructions are not exposed.

## 13. Custom Player Actions

Custom actions are treated as untrusted intent.

Pipeline:

```text
raw player text
 -> length/character validation
 -> intent classification / rule mapping
 -> legality check
 -> deterministic resolution
 -> narrative facts
 -> AI narration
```

The AI prompt should clearly separate player text from system instructions.

Never concatenate custom user text into a privileged instruction section without delimiting it.

## 14. Hallucination Control

The AI will occasionally invent facts.

Mitigation:
- structured output;
- explicit fact lists;
- instruct model not to create mechanical rewards;
- semantic validation;
- entity ID validation;
- reject invalid output;
- regenerate with correction context;
- deterministic fallback narrative.

Examples of invalid AI claims:
- companion joined without a validated companion event;
- player gained five levels;
- a dead NPC is alive without resurrection state;
- an item exists but no definition/reward exists;
- quest completed without objective transition.

## 15. Semantic Validation

JSON schema validation is necessary but insufficient.

Semantic validation should check:
- choice count boundaries;
- referenced IDs exist;
- narrative does not contradict mandatory resolved facts where detectable;
- output lengths;
- scene tags belong to allowed enums;
- no unsupported state-changing fields are accepted.

## 16. Fallback Narrative

The game must remain playable if AI is unavailable.

Fallback options:
- deterministic templates for combat;
- deterministic quest text templates;
- cached scene summaries;
- concise generic continuation explaining resolved facts.

Fallback quality can be lower, but state integrity must remain intact.

## 17. Retry Policy

Recommended AI retry sequence:

1. initial request;
2. one retry for transient provider errors with bounded backoff;
3. one correction attempt for malformed structured output;
4. optional fallback model;
5. deterministic fallback.

Do not retry indefinitely.

## 18. Timeouts

Every AI call must have a timeout.

Timeout behavior should be explicit:
- show recoverable UI state;
- avoid double-resolving mechanics;
- allow safe retry using the same turn/idempotency record.

## 19. Streaming

Streaming can improve perceived latency, but must not compromise state integrity.

Possible design:

```text
Turn created/reserved
 -> mechanics resolved
 -> narrative stream begins
 -> chunks sent to browser
 -> structured final response validated
 -> turn marked COMPLETED
```

If the stream fails, the backend must know whether the turn is retryable and whether mechanical state has already been committed.

## 20. AI Cost Control

Track per request:
- provider;
- model;
- input tokens;
- output tokens;
- latency;
- estimated cost where calculable;
- user/session;
- prompt ID/version.

Cost reduction strategies:
- short structured context;
- summaries instead of transcripts;
- smaller model for memory summarization/classification;
- caching immutable world definitions;
- concise maximum narrative length;
- avoid generating hidden text that is never displayed.

## 21. Local LLM Path

Future local model support should use the same project-owned interface.

A local adapter may target:
- Ollama;
- llama.cpp server;
- vLLM;
- another OpenAI-compatible endpoint.

The game must not depend on provider-specific response structures outside adapters.

Local models may be especially suitable for:
- summarization;
- NPC chatter;
- classification;
- low-stakes flavor generation.

Higher-quality cloud models can remain configurable for main narrative if desired.

## 22. Testing AI Features

Never run live paid AI calls in ordinary unit tests.

Use deterministic fixtures/fakes for:
- successful narrative;
- malformed JSON;
- timeout;
- refusal;
- invalid entity ID;
- contradictory narrative metadata;
- provider outage.

Optional contract/smoke tests against real providers should be manually or specially gated.

## 23. AI Safety and Content Controls

At minimum:
- do not expose secrets/system prompts;
- sanitize rendered generated content;
- separate user text from privileged instructions;
- enforce configured content boundaries;
- avoid executable HTML/JS from AI output;
- log safety failures without leaking sensitive prompt data.

## 24. AI GM Definition of Done

A new AI-generated feature is complete when:
- provider-independent contract exists;
- prompt is versioned;
- input is bounded;
- output has runtime schema validation;
- semantic validation exists where required;
- failure and timeout paths exist;
- deterministic fake tests exist;
- no mechanical state trusts raw LLM output.