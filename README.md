# Isekai Life RPG

AI-powered browser RPG where the player is reincarnated into a persistent fantasy world that reacts to choices, relationships, combat, reputation, and long-term consequences.

The current repository is an early React/Vite prototype with an Express server and Gemini-powered story generation. The target product is a server-authoritative, persistent RPG platform where AI is the narrator and content generator, while deterministic game systems remain owned and validated by the backend.

## Product Direction

The goal is not to build a chat interface with RPG styling. The goal is to build an actual game.

The final experience should combine:

- branching interactive fiction;
- deterministic RPG progression;
- AI-generated narrative and dialogue;
- persistent characters and worlds;
- quests and world events;
- companion relationships and romance;
- tactical combat encounters;
- inventory, equipment, crafting, and economy;
- factions, reputation, karma, and political consequences;
- achievements and multiple endings;
- procedural world content;
- account-based cloud saves;
- optional multiplayer/social systems later.

## Core Design Principle

**AI proposes narrative. The game engine owns truth.**

The LLM may describe an enemy attack, reward, discovery, relationship event, or quest result, but it must never directly become the authoritative source for HP, inventory, currency, experience, quest completion, or other critical state.

The backend validates actions, runs deterministic rules, persists the resulting state, and then supplies bounded context to the AI Game Master.

## Current Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Express
- Gemini API

## Target Stack

### Web client

- React + TypeScript
- Vite
- TanStack Query
- Zustand or equivalent local UI state
- Web Audio API
- responsive desktop/mobile UI

### Backend

- Node.js 22+
- TypeScript
- Fastify or structured Express modules
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ for asynchronous jobs
- WebSocket/SSE for streamed story generation and game events

### AI

- provider abstraction (`AIProvider`)
- Gemini as the first provider
- optional OpenAI/local LLM providers later
- structured outputs only
- prompt/version registry
- deterministic validation after every AI response

### Infrastructure

- Docker / Docker Compose
- PostgreSQL container
- Redis container
- API container
- web container or single production gateway
- health checks
- structured logs
- optional OpenTelemetry + Prometheus/Grafana later

## Repository Direction

The intended future structure is:

```text
.
├── apps/
│   ├── web/                 # React browser game
│   └── api/                 # HTTP/WebSocket backend
├── packages/
│   ├── contracts/           # Shared API DTOs and schemas
│   ├── game-core/           # Deterministic RPG rules
│   ├── ai-core/             # AI provider contracts and prompt orchestration
│   └── config/              # Shared configuration
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/
├── docker-compose.yml
├── AGENTS.md
└── TASKS.md
```

The migration to this layout should happen incrementally. Do not rewrite the entire prototype in one step.

## Main Game Loop

1. Player creates or loads a character.
2. Backend loads the authoritative game session.
3. Player receives a scene and allowed actions.
4. Player selects a choice or submits a bounded custom action.
5. Backend validates the action and resource costs.
6. Deterministic game systems resolve combat/checks/rewards/state transitions.
7. AI Game Master turns the validated result into narrative, dialogue, scene metadata, and candidate future choices.
8. Backend validates and persists the final turn.
9. Client renders story, effects, updated stats, map, quests, companions, and choices.
10. Important events are summarized into long-term memory.

## Documentation

Start here:

- [AGENTS.md](./AGENTS.md) — rules for coding agents and contributors
- [TASKS.md](./TASKS.md) — implementation plan and execution order
- [Product Vision](./docs/PRODUCT_VISION.md)
- [Game Design](./docs/GAME_DESIGN.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Backend Architecture](./docs/BACKEND.md)
- [AI Game Master](./docs/AI_GAME_MASTER.md)
- [Database Schema](./docs/DATABASE.md)
- [API Specification](./docs/API.md)
- [Security](./docs/SECURITY.md)
- [Development & Docker](./docs/DEVELOPMENT.md)
- [Testing Strategy](./docs/TESTING.md)
- [Roadmap](./docs/ROADMAP.md)

## Development Rules

- Keep TypeScript strict.
- Never expose AI provider secrets to the browser.
- Never trust game state supplied by the browser.
- Do not let the LLM directly mutate persistent state.
- Use explicit schemas for API input/output.
- Use database transactions for turn resolution.
- Every state-changing action must be idempotent or protected by an idempotency key.
- Add tests with every new gameplay rule.
- Prefer small vertical slices over large speculative rewrites.

## Local Development Target

Once the backend migration milestone is complete, the expected developer flow will be:

```bash
cp .env.example .env
docker compose up --build
```

Expected services:

```text
Web:        http://localhost:5173
API:        http://localhost:3000
Postgres:   localhost:5432
Redis:      localhost:6379
```

## Immediate Priority

The current prototype sends large parts of the player state from the browser to the server. The first engineering milestone is therefore **Server-Authoritative Game Sessions**.

Until that milestone is complete, adding large amounts of new gameplay content should be secondary to establishing persistence, validation, save/load support, and a clean game engine boundary.

## Status

Prototype / pre-alpha.

The repository should be treated as an experimental playable foundation, not production-ready game infrastructure.