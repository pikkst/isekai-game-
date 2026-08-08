# Architecture

## 1. Architecture Goals

The architecture must support:
- server-authoritative game state;
- persistent long-running campaigns;
- deterministic RPG mechanics;
- AI-generated narrative with bounded authority;
- recoverable AI failures;
- testability;
- Docker-first local development;
- future horizontal scaling;
- provider flexibility for Gemini, OpenAI, and local LLMs.

## 2. High-Level Architecture

```text
Browser
  |
  | HTTPS / SSE or WebSocket
  v
Web/API Gateway
  |
  +--> Auth / Session boundary
  |
  +--> Application Services
          |
          +--> Game Core
          |     - combat
          |     - progression
          |     - quests
          |     - inventory
          |     - checks/RNG
          |     - relationships
          |
          +--> Persistence
          |     - PostgreSQL
          |
          +--> Cache / Queue
          |     - Redis
          |     - BullMQ
          |
          +--> AI Orchestration
                |
                +--> Gemini adapter
                +--> OpenAI adapter later
                +--> Local LLM adapter later
```

## 3. Target Repository Structure

```text
apps/
  web/
    src/
      api/
      components/
      features/
      hooks/
      routes/
      state/
      styles/

  api/
    src/
      app.ts
      server.ts
      config/
      middleware/
      modules/
        auth/
        characters/
        sessions/
        turns/
        combat/
        quests/
        inventory/
        companions/
        world/
        ai/
      infrastructure/
        db/
        redis/
        queue/
        telemetry/

packages/
  contracts/
    src/
      api/
      events/
      schemas/

  game-core/
    src/
      rng/
      checks/
      progression/
      combat/
      inventory/
      equipment/
      skills/
      quests/
      companions/
      factions/
      world/

  ai-core/
    src/
      provider.ts
      prompts/
      schemas/
      memory/
      orchestration/

prisma/
  schema.prisma
  migrations/

docs/
```

## 4. Layering

### Transport layer

Responsibilities:
- HTTP/WebSocket/SSE;
- request parsing;
- authentication;
- schema validation;
- mapping domain errors to API errors.

Must not contain game rules.

### Application layer

Responsibilities:
- orchestrate use cases;
- load repositories;
- open transactions;
- call game-core;
- call AI orchestration;
- persist final result.

Examples:
- StartGameSessionService;
- ResolveTurnService;
- UseInventoryItemService;
- EquipItemService;
- ResumeSessionService.

### Domain/game-core layer

Responsibilities:
- pure deterministic rules;
- state transitions;
- validation of legal actions;
- calculations;
- game invariants.

It should have no knowledge of:
- HTTP;
- Express/Fastify;
- Prisma;
- Redis;
- Gemini/OpenAI;
- React.

### Infrastructure layer

Responsibilities:
- PostgreSQL repositories;
- Redis;
- queues;
- provider SDK adapters;
- logging/tracing implementations.

## 5. Turn Resolution Architecture

A complete player turn is the most important transaction in the game.

```text
1. Receive TurnCommand
2. Validate schema
3. Authenticate player
4. Check idempotency key
5. Begin DB transaction
6. Lock/load active session
7. Validate expected session version
8. Validate action against current state
9. Resolve deterministic mechanics
10. Build NarrativeFacts
11. Commit deterministic pending state only when pipeline policy allows
12. Generate narrative through AI provider
13. Validate structured AI output
14. Apply only allowed narrative metadata
15. Persist GameTurn + new state + memory/events
16. Store idempotency result
17. Commit transaction
18. Return GameSessionProjection
```

For long AI calls, holding a DB transaction open may be undesirable. A production implementation may use a two-phase turn state:

```text
PENDING -> RESOLVING -> COMPLETED
                    -> FAILED_RETRYABLE
```

The chosen implementation must prevent two concurrent turns from advancing one session simultaneously.

## 6. Session Concurrency

Every `GameSession` should have a monotonically increasing version.

Example:

```text
session.version = 42
client action expects version 42
successful turn -> version 43
```

If two requests target version 42, only one may succeed.

Use:
- DB row locking; or
- optimistic update with `WHERE version = expectedVersion`.

Idempotency is separate from concurrency. Both are required.

## 7. Event Model

Important game transitions should produce project-owned domain events.

Examples:
- CharacterLeveledUp
- ItemGranted
- ItemConsumed
- QuestAccepted
- QuestCompleted
- QuestFailed
- CompanionJoined
- RelationshipStageChanged
- FactionStandingChanged
- BossDefeated
- PlayerDefeated
- EndingReached

Events can support:
- achievements;
- analytics;
- memory generation;
- notifications;
- future multiplayer/social features.

## 8. Client State Strategy

The client owns UI state, not game truth.

Client-owned examples:
- open modal;
- selected tab;
- animation preference;
- pending text input;
- local audio volume.

Server-owned examples:
- HP;
- level;
- XP;
- skills;
- inventory;
- equipment;
- companion state;
- quest state;
- world state;
- legal choices;
- turn number.

Use TanStack Query or equivalent for server-state synchronization.

## 9. API Contracts

All external request/response schemas should live in `packages/contracts`.

Recommended validation:
- Zod schemas;
- generated TypeScript types from schemas where practical.

Do not maintain one handwritten backend type and another unrelated frontend copy.

## 10. AI Boundary

AI orchestration receives a bounded object, not arbitrary database entities.

Example conceptual input:

```ts
interface NarrativeContext {
  scene: SceneContext;
  resolvedAction: ResolvedActionFacts;
  characterSummary: CharacterNarrativeSummary;
  questContext: QuestNarrativeContext[];
  companionContext: CompanionNarrativeContext[];
  memories: StoryMemorySummary[];
  worldFacts: WorldNarrativeFact[];
}
```

AI output is validated and converted into a project-owned `NarrativeResult`.

## 11. Memory Architecture

Do not resend an entire campaign transcript.

Memory retrieval pipeline:

```text
recent turns
+ active quest facts
+ active NPC/companion facts
+ high-importance memories
+ relevant world facts
= bounded narrative context
```

Optional semantic retrieval can be added later, but simple indexed relational retrieval should be preferred first.

## 12. Background Jobs

Use BullMQ/Redis for work that should not block a game request where immediate completion is unnecessary.

Candidates:
- long-term memory summarization;
- scene image generation;
- achievement recomputation;
- analytics aggregation;
- abandoned session cleanup;
- world-event scheduling;
- email notifications later.

Turn-critical mechanics should not depend on an eventually executed queue job.

## 13. Caching

Redis is appropriate for:
- rate-limit counters;
- short-lived session locks;
- idempotency acceleration;
- model/provider circuit-breaker state;
- frequently read immutable definitions.

PostgreSQL remains the source of truth for persistent game state.

## 14. Definition Data

Separate definitions from runtime instances.

Definitions:
- items;
- skills;
- enemies;
- quests/templates;
- factions;
- locations.

Runtime instances:
- player inventory entries;
- unlocked skills;
- active encounter;
- quest progress;
- faction standing.

Definitions may initially live in version-controlled TypeScript/JSON and later move to a content management workflow.

## 15. Observability

Every turn should have:
- request ID;
- session ID;
- turn ID;
- user ID when authenticated;
- AI provider/model;
- prompt version;
- AI latency;
- total turn latency;
- token/usage data where available;
- failure category.

Never log secrets or unnecessary full private prompts.

## 16. Scaling Path

Initial deployment may be one API instance plus PostgreSQL/Redis.

Future scaling:
- stateless API replicas;
- shared PostgreSQL;
- shared Redis;
- queue workers;
- object storage/CDN for generated media;
- load balancer/reverse proxy.

Game sessions must not depend on process-local memory.

## 17. Architectural Decision Priorities

When trade-offs appear, prioritize in this order:

1. state correctness;
2. recoverability;
3. testability;
4. security;
5. player latency;
6. operating cost;
7. implementation elegance.

AI creativity must never outrank state correctness.