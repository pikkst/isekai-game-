# TASKS.md

Canonical implementation backlog for evolving the current browser prototype into a persistent, server-authoritative, AI-driven Isekai RPG.

Tasks are ordered by dependency. Foundational milestones must be completed before large amounts of new content are added.

## Phase 0 — Engineering Baseline

### [ ] M000 Repository quality baseline

**Outcome:** reliable build, validation and CI foundation.

Required work:
- enable strict TypeScript settings;
- add ESLint and formatting rules;
- add `.editorconfig` and supported Node version;
- expose `typecheck`, `lint`, `test`, and `build` scripts;
- add GitHub Actions CI;
- validate environment variables at startup;
- document all required secrets and runtime variables;
- verify production build and startup.

Acceptance criteria:
- a clean checkout installs and builds;
- CI runs typecheck, tests and build;
- no real secrets are tracked;
- README development instructions work.

## Phase 1 — Server-Authoritative Foundation

### [ ] M001 Application and package boundaries

**Outcome:** separate web UI, backend, contracts, deterministic game logic and AI orchestration.

Target layout:

```text
apps/web
apps/api
packages/contracts
packages/game-core
packages/ai-core
```

Required work:
- move React app into `apps/web`;
- move API into `apps/api`;
- create shared API/schema package;
- create pure `game-core` package;
- create provider-independent `ai-core` package;
- preserve existing playable behavior during migration.

Acceptance criteria:
- frontend and backend build independently;
- domain code imports neither React, Express, Prisma nor Gemini;
- shared contracts are not duplicated.

### [ ] M002 Docker development stack

**Outcome:** one-command local development environment.

Required work:
- Dockerfile for API;
- Dockerfile for web or a unified production image;
- PostgreSQL service;
- Redis service;
- Docker Compose networking and named volumes;
- health checks;
- startup dependency handling;
- environment validation;
- development and production image stages where useful.

Acceptance criteria:

```bash
docker compose up --build
```

starts the complete required local stack.

### [ ] M003 PostgreSQL and Prisma persistence

**Outcome:** persistent characters, sessions, turns and world state.

Initial models:
- User
- Character
- GameSession
- CharacterState
- GameTurn
- InventoryEntry
- EquipmentSlot
- SkillUnlock
- CompanionState
- QuestInstance
- WorldState
- StoryMemory
- IdempotencyRecord

Required work:
- Prisma schema;
- initial migration;
- repository layer;
- transaction boundaries;
- DB readiness/health check;
- development seed path;
- query indexes.

Acceptance criteria:
- a game survives browser refresh and API restart;
- a session can be reconstructed from PostgreSQL;
- database constraints prevent duplicate critical records.

### [ ] M004 Server-owned game sessions

**Outcome:** browser no longer submits authoritative stats/world/inventory.

Target turn request:

```json
{
  "sessionId": "uuid",
  "action": {
    "type": "choice",
    "choiceId": "choice_03"
  },
  "idempotencyKey": "uuid"
}
```

Backend must:
- load the session;
- verify ownership;
- verify status is playable;
- verify action legality;
- resolve deterministic rules;
- call AI only with approved facts/context;
- persist the complete turn atomically;
- return a client projection.

Acceptance criteria:
- editing HP, level, XP, inventory or currency in browser dev tools cannot mutate server state.

### [ ] M005 Save, resume and recovery

Required work:
- active save/session list;
- resume endpoint;
- autosave after every committed turn;
- session version field;
- optimistic concurrency control;
- duplicate request protection;
- recovery behavior for interrupted AI generation.

Acceptance criteria:
- refresh, reconnect, backend restart and duplicate HTTP requests do not lose or duplicate committed progress.

## Phase 2 — Deterministic RPG Core

### [ ] M006 Seeded RNG and checks

Implement:
- injectable RNG interface;
- seeded test RNG;
- stat checks;
- difficulty classes;
- success tiers;
- critical success/failure;
- luck modifiers;
- roll audit metadata.

### [ ] M007 Character progression

Implement:
- XP curve;
- level thresholds;
- stat points;
- skill points;
- derived HP/MP;
- stat caps;
- progression rewards;
- titles and milestones.

All progression must live in `game-core` and be unit tested.

### [ ] M008 Inventory and equipment engine

Implement:
- item definitions;
- stack rules;
- consumables;
- weapons/armor/accessories;
- rarity;
- equip/unequip;
- deterministic item effects;
- inventory capacity policy;
- reward validation.

### [ ] M009 Skill engine

Implement:
- skill definitions;
- prerequisites;
- unlock costs;
- MP/resource costs;
- cooldowns;
- passive modifiers;
- cheat/divine skills;
- upgrade paths;
- deterministic effect execution.

### [ ] M010 Combat engine v1

Implement:
- encounter state;
- initiative;
- physical and magical attacks;
- attack/defense formulas;
- critical hits;
- evade/block;
- buffs/debuffs;
- status effects;
- resource costs;
- enemy turns;
- victory/defeat;
- flee/surrender;
- loot and XP rewards.

Design rule: the engine resolves combat first; AI narrates the already-resolved facts.

### [ ] M011 Death, defeat and resurrection

Define:
- defeat state;
- fate-point rescue;
- resurrection options;
- penalties;
- story consequences;
- optional hardcore/permadeath mode later.

## Phase 3 — Persistent World and Quests

### [ ] M012 World model

Implement:
- regions;
- locations;
- travel graph;
- danger levels;
- settlements;
- factions;
- world flags;
- global events;
- world clock;
- discovered/hidden locations.

### [ ] M013 Quest engine

Quest categories:
- main story;
- side quest;
- companion quest;
- faction quest;
- bounty;
- exploration;
- dynamic world event.

Required mechanics:
- prerequisites;
- stages;
- objectives;
- branching transitions;
- failure conditions;
- optional deadlines;
- rewards;
- consequences;
- quest journal projection.

### [ ] M014 Dynamic encounter director

Inputs:
- region;
- player power;
- current quests;
- faction reputation;
- karma;
- recent encounters;
- world threat;
- narrative pacing.

Output: a bounded encounter specification validated by the engine before AI narration.

### [ ] M015 Factions and reputation

Implement:
- faction definitions;
- standing range;
- rank tiers;
- hostility/alliance;
- reputation gates;
- faction rewards;
- faction-driven world consequences.

### [ ] M016 Economy and merchants

Implement:
- currency;
- merchant inventories;
- buy/sell rules;
- scarcity modifiers;
- reward ranges;
- currency sinks;
- anti-exploit validation.

### [ ] M017 Crafting and gathering

Add only after inventory and economy are stable.

Implement:
- recipes;
- materials;
- gathering sources;
- crafting stations;
- quality/rarity;
- crafting progression.

## Phase 4 — NPCs, Companions and Relationships

### [ ] M018 Persistent NPC identity system

Persist:
- canonical NPC ID;
- name;
- role;
- faction;
- traits;
- goals;
- relationship state;
- known facts;
- location;
- alive/dead/missing state;
- important memories.

AI dialogue must consume persistent identity facts instead of recreating NPC identity each turn.

### [ ] M019 Companion system

Implement:
- recruitment;
- party slots;
- loyalty;
- affection;
- trust;
- level/progression;
- combat abilities;
- personal quests;
- conflict;
- leaving/betrayal/death states.

### [ ] M020 Relationship and romance engine

Rules:
- relationship stages are deterministic;
- major milestones require explicit game events;
- AI dialogue adapts to current relationship state;
- one AI response cannot arbitrarily jump multiple relationship stages;
- configurable content boundaries must be respected.

### [ ] M021 Dialogue scene system

Support:
- dialogue choices;
- persuasion/intimidation checks;
- gifts;
- secrets;
- relationship changes;
- quest information;
- scene exit conditions.

## Phase 5 — AI Game Master Platform

### [ ] M022 AI provider abstraction

Implement project-owned provider contracts with:
- Gemini adapter;
- deterministic fake adapter;
- model configuration;
- timeout;
- retry/backoff;
- fallback models;
- usage metadata;
- project-owned errors;
- optional OpenAI/local LLM adapters later.

### [ ] M023 Structured turn generation pipeline

Target pipeline:

```text
load state
  -> validate action
  -> resolve deterministic mechanics
  -> build approved narrative facts
  -> retrieve bounded memory
  -> call AI
  -> schema validate
  -> semantic validate
  -> sanitize
  -> persist atomically
  -> return projection
```

### [ ] M024 Prompt registry and versioning

Track for every generated turn:
- prompt ID;
- prompt version;
- schema version;
- provider/model;
- generation parameters;
- optional rollout/experiment ID.

### [ ] M025 Layered long-term memory

Memory layers:
1. current scene;
2. recent turn summaries;
3. active quest memories;
4. active companion memories;
5. character-defining memories;
6. relevant world facts;
7. retrieved long-term memories.

Implement:
- importance scoring;
- summarization;
- deduplication;
- bounded retrieval;
- archival policy.

### [ ] M026 Narrative director

Track:
- current story arc;
- chapter/act;
- tension;
- unresolved hooks;
- recent combat/social/exploration cadence;
- main objective;
- climax readiness.

Purpose: prevent endless random scenes and create deliberate pacing.

### [ ] M027 AI failure resilience

Handle:
- provider outage;
- malformed structured output;
- timeout;
- safety refusal;
- token/context overflow;
- duplicate request;
- partial streaming failure.

A player must never lose a valid committed game state because narrative generation failed.

## Phase 6 — Epic Browser Experience

### [ ] M028 Interactive world map

Display:
- discovered regions;
- current location;
- routes;
- quest markers;
- danger levels;
- faction territory;
- secret/locked locations.

### [ ] M029 Quest journal

Tabs:
- main;
- side;
- companion;
- faction;
- completed;
- failed;
- rumors.

### [ ] M030 Character sheet v2

Display:
- primary stats;
- derived stats;
- equipment;
- status effects;
- titles;
- skill tree;
- progression preview;
- faction reputation.

### [ ] M031 Combat presentation

Add:
- dedicated combat mode;
- target selection;
- ability controls;
- animated HP/MP;
- status effects;
- battle log;
- hit/critical/block feedback;
- sound and impact effects.

### [ ] M032 Scene presentation engine

Scene metadata supports:
- background art;
- character portraits;
- character focus;
- weather overlay;
- particle effects;
- music mood;
- ambient audio;
- dialogue speaker;
- camera/emphasis metadata.

### [ ] M033 Streaming narrative UX

Implement:
- SSE or WebSocket streaming;
- reconnect behavior;
- generation state;
- retry/cancel where safe;
- no duplicate committed turns;
- optional typewriter rendering.

### [ ] M034 Responsive/mobile UX

Core gameplay must work comfortably on desktop, tablet and mobile browsers.

### [ ] M035 Accessibility

Implement:
- keyboard navigation;
- semantic controls;
- reduced motion;
- scalable text;
- appropriate contrast;
- screen-reader-friendly live state changes.

## Phase 7 — Accounts and Production Readiness

### [ ] M036 Authentication

Use a proven identity solution or safe passwordless/OAuth flow. Do not invent custom password cryptography.

### [ ] M037 User profiles and cloud saves

Implement:
- multiple characters;
- multiple runs;
- active/archived sessions;
- account ownership;
- save metadata;
- playtime;
- achievement summary.

### [ ] M038 AI rate limits and budgets

Control:
- requests per user;
- concurrent generations;
- daily token/cost budget;
- custom action length;
- retry abuse;
- anonymous limits if anonymous mode exists.

### [ ] M039 Observability

Add:
- structured logs;
- request IDs;
- session/turn IDs;
- AI latency and failures;
- DB latency;
- queue depth;
- turn success/failure metrics;
- token usage and cost estimates;
- OpenTelemetry;
- Prometheus/Grafana when deployment warrants it.

### [ ] M040 Production deployment

Implement:
- multi-stage images;
- non-root containers;
- readiness/liveness endpoints;
- migration deployment strategy;
- secret injection;
- database backup plan;
- reverse proxy/TLS deployment path.

## Phase 8 — Replayability and Meta Progression

### [ ] M041 Achievement engine
### [ ] M042 Lore/codex discovery system
### [ ] M043 New Game+
### [ ] M044 State-driven multiple endings
### [ ] M045 Scenario/world packs

Candidate scenario packs:
- classic high fantasy;
- dark demon kingdom;
- cyberpunk cultivation;
- academy/otome;
- post-apocalyptic magic;
- monster reincarnation.

## Phase 9 — Optional Social Systems

Explicitly not MVP requirements:

### [ ] M046 Shareable character builds
### [ ] M047 Community scenario packs
### [ ] M048 Shareable story/run summaries
### [ ] M049 Cooperative encounters
### [ ] M050 Asynchronous player/world interactions

## Recommended Execution Order

Do not simply work from the most visually exciting feature.

Recommended first implementation sequence:

```text
M000 -> M001 -> M002 -> M003 -> M004 -> M005
-> M006 -> M007 -> M008 -> M009 -> M010
-> M012 -> M013
-> M018 -> M019
-> M022 -> M023 -> M024 -> M025 -> M026 -> M027
-> M028 onward
```

The first major product milestone is reached when a player can create a character, play multiple server-authoritative turns, fight a deterministic encounter, complete a quest, close the browser, return later, and continue the exact same persistent story.