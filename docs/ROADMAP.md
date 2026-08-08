# Roadmap

## 1. Roadmap Principle

The roadmap follows dependency order, not feature excitement.

The project becomes more valuable when it first gains reliable state, meaningful mechanics and continuity. Large amounts of AI-generated content should come after those foundations.

## 2. Stage A — Prototype Stabilization

### Goal

Turn the current prototype into a reliable development baseline without changing the core player experience unnecessarily.

### Deliverables
- strict TypeScript;
- lint/format configuration;
- CI;
- explicit environment validation;
- improved error handling;
- provider model configuration outside gameplay code;
- fake AI provider foundation;
- documented local development.

### Exit condition

A clean checkout builds reliably and the existing prototype behavior can be exercised without hidden machine-specific setup.

## 3. Stage B — Persistent Backend Foundation

### Goal

Make the server the owner of the game.

### Deliverables
- app/package boundaries;
- Docker Compose;
- PostgreSQL;
- Prisma migrations;
- Redis;
- persistent character/session/turn models;
- server-owned session state;
- save/resume;
- idempotency;
- concurrency/version checks.

### Exit condition

A player can start a game, play multiple turns, refresh/restart the backend and resume without losing progress. Browser-modified stats do not alter authoritative state.

## 4. Stage C — Real RPG Mechanics

### Goal

Replace narrative-only mechanics with deterministic systems.

### Deliverables
- seeded RNG/check engine;
- progression;
- inventory/equipment;
- skill engine;
- combat v1;
- defeat/recovery;
- domain events.

### Exit condition

The same mechanical input and RNG seed can reproduce the same combat/check outcome independent of the AI model.

## 5. Stage D — World and Quest Vertical Slice

### Goal

Create a playable high-fantasy region with real goals and consequences.

### Deliverables
- location graph;
- discovered locations;
- world flags;
- quest engine;
- main quest chain;
- side quests;
- factions/reputation;
- dynamic encounters;
- merchant/economy basics.

### Exit condition

A player can explore, accept/complete/fail quests, alter faction/world state and receive validated rewards.

## 6. Stage E — Persistent NPC and Companion Experience

### Goal

Make recurring characters feel remembered and mechanically meaningful.

### Deliverables
- persistent NPC identity;
- companion recruitment;
- loyalty/trust/affection;
- personal companion quest;
- dialogue checks;
- relationship stages;
- important NPC memories.

### Exit condition

One deeply implemented companion can remember earlier events, react to player state and reach multiple relationship outcomes without AI inventing the mechanical state.

## 7. Stage F — AI Game Master v2

### Goal

Upgrade AI from a single prompt into a resilient orchestration platform.

### Deliverables
- project-owned AI provider abstraction;
- Gemini adapter;
- fake adapter;
- optional OpenAI/local provider compatibility;
- prompt registry/versioning;
- structured schemas;
- semantic validation;
- layered memory;
- narrative director;
- retries/timeouts/fallback;
- usage/cost metadata.

### Exit condition

Provider failures, malformed output and model changes do not corrupt game state, and narrative remains coherent over long sessions through bounded memory.

## 8. Stage G — Epic Browser Presentation

### Goal

Turn the strong backend/game loop into a polished browser game experience.

### Deliverables
- redesigned character sheet;
- quest journal;
- interactive world map;
- combat mode UI;
- companion/relationship UI;
- scene presentation metadata;
- background/portrait support;
- audio moods;
- streaming narrative;
- responsive mobile layout;
- accessibility improvements.

### Exit condition

The experience is visually understandable and satisfying without requiring the player to interpret raw AI chat output or raw JSON-like game state.

## 9. Stage H — MVP Release Candidate

### Goal

Package one complete replayable campaign slice for external testing.

### Required content
- one polished high-fantasy scenario;
- one main arc;
- several side quests;
- one deep companion;
- several enemies plus boss;
- multiple cheat skills/build options;
- two meaningful endings;
- persistent saves;
- deterministic fake AI for testing;
- production-like deployment.

### Required operations
- authentication or controlled test-access model;
- rate limits;
- cost limits;
- structured logs;
- DB backups;
- health/readiness;
- monitoring baseline;
- E2E regression suite.

### Exit condition

External users can complete and replay the vertical slice without developer intervention.

## 10. Stage I — Content Expansion

Only after MVP stability.

Potential additions:
- second/third companions;
- crafting;
- more factions;
- more regions;
- more endings;
- boss variants;
- rare world events;
- advanced skill trees;
- codex;
- achievements;
- New Game+.

## 11. Stage J — Scenario Platform

### Goal

Reuse the engine for multiple Isekai genres.

Potential packs:
- demon-lord route;
- monster evolution;
- cyberpunk cultivation;
- academy/otome;
- post-apocalyptic magic;
- dungeon core;
- kingdom-building campaign.

A scenario pack should primarily define content/configuration and only add new engine mechanics when genuinely necessary.

## 12. Stage K — Optional Social Layer

Only after single-player persistence/gameplay is strong.

Potential features:
- shareable run summaries;
- character build cards;
- community challenges;
- scenario sharing;
- asynchronous world traces;
- cooperative encounters.

Avoid real-time multiplayer until there is a clear product reason and the architecture is ready for it.

## 13. Suggested Development Milestones

### Milestone 1 — Persistent Turn

Deliver:
- Docker/Postgres;
- session schema;
- server-authoritative `start` and `turn`;
- save/resume;
- fake AI tests.

This is the most important near-term milestone.

### Milestone 2 — First Deterministic Battle

Deliver:
- RNG/checks;
- combat engine;
- enemy definitions;
- combat UI integration;
- persisted combat outcome.

### Milestone 3 — First Real Quest

Deliver:
- quest state machine;
- objective tracking;
- validated rewards;
- quest journal;
- persistent world consequence.

### Milestone 4 — First Persistent Companion

Deliver:
- NPC identity;
- recruitment;
- relationship state;
- personal memories;
- companion quest;
- relationship-aware dialogue.

### Milestone 5 — Coherent 50-Turn Run

Deliver:
- layered memory;
- narrative director;
- AI fallbacks;
- cost tracking;
- long-session regression tests.

### Milestone 6 — MVP Campaign

Deliver the complete scope defined in `MVP_SCOPE.md`.

## 14. Prioritization Rules

When choosing the next task, score it by:
- dependency importance;
- player impact;
- state-integrity risk;
- ability to test;
- ability to enable later systems;
- implementation cost.

High-dependency infrastructure may outrank immediately visible content.

## 15. What Not to Do Yet

Avoid spending major engineering effort on:
- multiplayer networking;
- user-generated mod editor;
- complex economy simulation;
- dozens of generated worlds;
- expensive media generation pipeline;
- native mobile clients;
- elaborate microservices;
- Kubernetes;
- large-scale vector infrastructure before memory retrieval needs it.

The initial product can be a well-structured modular monolith with PostgreSQL, Redis and external AI providers.

## 16. Success Horizon

The architecture should support a path from:

```text
AI Studio prototype
 -> persistent browser RPG
 -> polished single-player AI RPG
 -> replayable scenario platform
 -> optional social ecosystem
```

Each step must remain playable and testable. Do not postpone correctness until a hypothetical final architecture.