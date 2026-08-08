# Development and Docker

## 1. Development Goal

A new developer should be able to clone the repository, configure local secrets, run one command, and receive a complete working development environment.

Target command:

```bash
docker compose up --build
```

## 2. Target Local Services

```text
web        React/Vite development UI
api        TypeScript backend
postgres   PostgreSQL durable storage
redis      cache, queue and rate-limit infrastructure
worker     optional BullMQ worker once background jobs exist
```

Recommended host ports during development:

```text
Web:       5173
API:       3000
Postgres:  5432
Redis:     6379
```

Do not depend on those exact internal container ports where service-name networking is available.

## 3. Prerequisites

Preferred developer prerequisite:
- Docker Desktop / Docker Engine with Compose.

For running without Docker during specialized development:
- Node.js 22+;
- package manager selected by the repository;
- PostgreSQL;
- Redis.

Docker remains the canonical reproducible environment.

## 4. Environment File

Repository should provide `.env.example` with placeholders only.

Future expected variables may include:

```text
NODE_ENV=development
API_PORT=3000
WEB_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://...
REDIS_URL=redis://redis:6379
AI_PROVIDER=gemini
GEMINI_API_KEY=
AI_NARRATIVE_MODEL=
AI_SUMMARY_MODEL=
AI_TIMEOUT_MS=30000
LOG_LEVEL=debug
```

Never commit populated `.env` files.

## 5. Environment Validation

The API must fail fast with a useful error if required production configuration is absent or malformed.

Use a schema such as Zod to validate:
- ports;
- URLs;
- provider names;
- required secrets;
- numeric limits;
- allowed environments.

Do not defer configuration errors until the first player turn.

## 6. Docker Compose Target

Conceptual future topology:

```yaml
services:
  postgres:
    image: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis

  api:
    build: ./apps/api
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  web:
    build: ./apps/web
    depends_on:
      - api
```

The actual compose file must pin appropriate supported image versions and define health checks.

## 7. Development Containers

Development images should optimize for:
- fast rebuilds;
- mounted source code where practical;
- dependency caching;
- source maps;
- hot reload.

Production images should optimize for:
- small size;
- reproducibility;
- non-root runtime;
- no dev dependencies;
- no source secrets;
- controlled startup.

Do not force one image design to serve both purposes poorly.

## 8. Database Migrations

Development workflow should provide commands similar to:

```bash
npm run db:migrate
npm run db:generate
npm run db:seed
npm run db:studio
```

Exact commands depend on workspace/package manager design.

Rules:
- migration files are committed;
- schema changes and migrations ship together;
- no production `db push` substitute for reviewed migrations;
- never rewrite already deployed migrations.

## 9. Seed Data

Seed scripts should load deterministic development definitions/data needed to exercise the game.

Examples:
- high-fantasy scenario;
- starter items;
- starter skills;
- factions;
- locations;
- enemies;
- initial quest definitions.

Seeds must not include real credentials.

## 10. Package Scripts

Target root scripts:

```text
dev
build
typecheck
lint
format
format:check
test
test:unit
test:integration
test:e2e
db:generate
db:migrate
db:seed
```

Root scripts should orchestrate workspaces rather than duplicate implementation.

## 11. Local AI Modes

Development should support at least two AI modes.

### Real provider mode

Uses configured Gemini/OpenAI key for manual testing.

### Fake provider mode

Uses deterministic local fixtures.

Example:

```text
AI_PROVIDER=fake
```

The fake mode is essential for:
- tests;
- offline development;
- predictable demos;
- debugging game logic without AI cost.

## 12. Hot Reload

During development:
- web uses Vite HMR;
- API uses `tsx watch`, nodemon or equivalent;
- Prisma client regeneration should be explicit/reliable;
- background worker can watch independently.

## 13. Logging

Development logs may be pretty-printed.

Production logs should be structured JSON.

Keep the same semantic fields where possible so bugs reproduce across environments.

## 14. Health Checks

Docker health checks should distinguish:
- process liveness;
- service readiness.

PostgreSQL and Redis should have their own health checks.

API readiness must not report healthy before required dependencies are usable.

## 15. Frontend API Configuration

In development, Vite may proxy `/api` to the API container/service.

In production, prefer one public origin through a reverse proxy/gateway when practical.

Never expose private database or Redis endpoints to the browser.

## 16. Generated Assets

If scene images/audio become generated artifacts:
- do not store large generated binary content in Git;
- use local object-storage-compatible development service or filesystem abstraction;
- production should use object storage/CDN;
- persist stable asset references/metadata in PostgreSQL.

## 17. Definition Content Workflow

Early game definitions can live in version control as validated JSON/TypeScript.

A content validation command should eventually verify:
- unique IDs;
- referenced IDs exist;
- enum values;
- quest graph validity;
- skill prerequisites;
- loot table references;
- location graph links.

## 18. Recommended Daily Workflow

```text
1. Pull latest main
2. Create focused feature branch
3. Start Docker stack
4. Run/use fake AI provider for most development
5. Implement one vertical slice
6. Run focused tests
7. Run typecheck + lint + test + build
8. Inspect migration/diff
9. Commit
10. Push and open PR when project workflow requires it
```

## 19. CI Target

Every PR/main update should eventually run:
- install with lockfile enforcement;
- typecheck;
- lint;
- unit tests;
- integration tests with PostgreSQL/Redis where needed;
- production build;
- migration validation;
- optional dependency/secret scan.

E2E tests can be a separate job if runtime is significant.

## 20. Production Build

Target architecture may use:
- static web assets served by a reverse proxy; plus
- separate API container;

or
- API/gateway serving built static assets for a simpler initial deployment.

Either is acceptable if boundaries in source remain clean.

## 21. Deployment Environments

Recommended progression:

```text
local -> test/CI -> staging -> production
```

Staging should use:
- separate DB;
- separate Redis;
- separate AI budget/key where practical;
- production-like migrations and container images.

## 22. Backup/Restore Development

Before production launch, create documented commands/procedures for:
- DB backup;
- DB restore into a clean environment;
- migration from restored backup;
- verification of player sessions after restore.

## 23. Troubleshooting Baseline

Common classes should have documented checks:
- API cannot reach PostgreSQL;
- Prisma migration mismatch;
- Redis unavailable;
- AI credential missing;
- AI provider timeout;
- web cannot reach API;
- stale Docker volume/schema;
- port conflicts.

Do not solve routine environment problems with undocumented machine-specific steps.

## 24. Development Definition of Done

The environment milestone is complete when a clean machine with Docker and an AI key can:

```bash
git clone ...
cp .env.example .env
# add required secret
docker compose up --build
```

and then create/load/play a persisted development game without installing PostgreSQL or Redis manually.