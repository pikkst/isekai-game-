# Testing Strategy

## 1. Testing Goal

The game must be testable without live AI providers and without relying on manual browser playthroughs for core correctness.

Testing priorities:
1. game-state correctness;
2. persistence safety;
3. duplicate/concurrent request safety;
4. API contract stability;
5. AI failure resilience;
6. critical player flows;
7. presentation behavior.

## 2. Test Layers

```text
Unit tests
  -> domain/game rules

Contract tests
  -> request/response schemas

Integration tests
  -> PostgreSQL/Redis/repositories/application services

AI adapter tests
  -> deterministic fake behavior and provider mapping

E2E tests
  -> browser-to-backend player journeys
```

## 3. Unit Tests

Unit tests are the primary protection for `packages/game-core`.

Required areas:
- stat allocation;
- derived stats;
- XP thresholds;
- level up;
- item stacking;
- item consumption;
- equipment effects;
- skill prerequisites;
- skill costs/cooldowns;
- deterministic RNG/checks;
- combat damage;
- critical hit logic;
- buffs/debuffs;
- quest transitions;
- faction standing;
- relationship thresholds;
- death/game-over rules;
- fate point spending.

Tests should use seeded/injected RNG rather than patching global randomness.

## 4. Property / Invariant Tests

Useful invariants:
- HP never exceeds max HP after normalization;
- HP cannot become negative in persisted projections unless negative HP is an intentional intermediate value;
- item quantity never persists below zero;
- spending a resource cannot increase it;
- XP level transitions are monotonic;
- one item instance cannot occupy two exclusive equipment slots;
- completed quest cannot return to active without explicit reset design;
- session version increases exactly once per committed mutation;
- same idempotency key cannot grant rewards twice.

Property-based testing can be introduced for combat/inventory/state-machine systems where valuable.

## 5. API Contract Tests

For every endpoint verify:
- valid request accepted;
- malformed request rejected;
- unknown fields policy behaves intentionally;
- unauthorized request rejected;
- ownership checked;
- stable error code returned;
- client cannot submit authoritative game-state values to mutate state;
- response matches public schema.

## 6. Repository Integration Tests

Use a real PostgreSQL instance in CI/test containers for persistence behavior that depends on:
- transactions;
- constraints;
- unique indexes;
- row locks;
- JSONB behavior;
- migrations.

Mocks are insufficient for proving transaction/concurrency semantics.

## 7. Turn Pipeline Integration Tests

Critical cases:

### Successful choice
- session loaded;
- action valid;
- mechanics resolved;
- fake AI called with expected bounded facts;
- turn persisted;
- session version incremented;
- projection returned.

### Invalid action
- no AI call;
- no state mutation;
- stable error returned.

### Duplicate request
- same idempotency key returns same result;
- rewards/state applied once.

### Concurrent turns
- only one stale-version request succeeds;
- other receives version conflict;
- no double rewards.

### AI timeout
- session remains recoverable;
- retry does not rerun mechanics incorrectly;
- correct retryable state/error returned.

### Invalid AI output
- schema/semantic validation rejects it;
- controlled retry/fallback path executes;
- raw invalid output does not mutate state.

## 8. AI Fake Provider

Create deterministic scenarios such as:
- `success_default`;
- `success_combat_victory`;
- `success_companion_scene`;
- `malformed_json`;
- `unknown_entity_reference`;
- `contradicts_required_fact`;
- `timeout`;
- `provider_unavailable`;
- `safety_refusal`;
- `stream_disconnect`.

Tests should select scenarios explicitly.

## 9. Live AI Tests

Live provider tests are optional smoke/contract tests and must not run in ordinary unit CI by default.

Requirements:
- explicit opt-in environment variable;
- strict request count;
- no assertions on exact prose;
- validate schema/capability behavior;
- report provider/model used;
- protect secrets.

## 10. Migration Tests

CI should verify:
- migrations apply from empty database;
- Prisma/client generation succeeds;
- schema is consistent;
- later, important upgrade paths from a representative previous schema can be tested.

Never rely only on local `db push` state.

## 11. E2E Test Framework

Recommended: Playwright.

Use deterministic fake AI for standard E2E suites.

## 12. Critical E2E Journeys

### E2E-001 New run
1. open app;
2. create character;
3. start game;
4. receive first persisted scene;
5. verify displayed character state.

### E2E-002 Multiple turns
1. resume active run;
2. choose actions across several turns;
3. verify turn count and state;
4. refresh browser;
5. verify exact run resumes.

### E2E-003 Combat
1. enter deterministic encounter;
2. use ability;
3. receive engine-resolved damage;
4. win/lose correctly;
5. verify reward exactly once.

### E2E-004 Inventory
1. obtain item;
2. use/equip item;
3. verify effects;
4. refresh;
5. verify persisted result.

### E2E-005 Quest
1. accept quest;
2. satisfy objective;
3. complete quest;
4. receive reward/reputation;
5. verify journal state after reload.

### E2E-006 Companion continuity
1. recruit companion;
2. produce relationship milestone;
3. reload;
4. verify companion identity/state/memory remains.

### E2E-007 Duplicate turn
Simulate network retry with same idempotency key and verify only one committed turn/reward.

## 13. Security Tests

At minimum:
- cannot access another user's session;
- cannot mutate state through modified client payload;
- cannot reuse an item after quantity reaches zero;
- cannot spend same resource concurrently;
- oversized custom action rejected;
- dangerous HTML in AI/user text renders safely;
- secrets are not returned in errors;
- rate limit returns expected behavior.

## 14. Load / Performance Tests

Before meaningful public traffic test:
- concurrent active sessions;
- DB turn writes;
- AI latency impact;
- rate-limit behavior;
- SSE/WebSocket connections if used;
- queue backlog.

Important metrics:
- p50/p95 turn API latency excluding AI and including AI;
- DB transaction latency;
- connection pool utilization;
- error rate;
- concurrent AI calls;
- token/cost rate.

## 15. Snapshot Tests

Use snapshots sparingly.

Good candidates:
- stable API/schema structures;
- generated deterministic fallback text templates where appropriate.

Bad candidate:
- exact live AI prose.

## 16. Fixtures

Version deterministic fixtures.

Fixture categories:
- character states;
- encounters;
- quest states;
- inventory states;
- companion relationships;
- world states;
- AI structured responses.

Fixtures should use project-owned models, not provider SDK objects.

## 17. Test Data Isolation

Each integration/E2E test should create isolated session/user IDs and clean up or use disposable databases.

Tests must be parallel-safe before enabling broad parallel execution.

## 18. CI Quality Gate

Minimum merge gate target:

```text
typecheck
lint
unit tests
integration tests
build
```

As the project matures add:

```text
E2E critical path
dependency scan
secret scan
migration validation
```

## 19. Regression Policy

Every confirmed production/gameplay bug should create a regression test at the lowest appropriate layer before or with the fix.

Examples:
- duplicated loot -> integration/idempotency test;
- wrong damage formula -> unit test;
- lost save after refresh -> E2E/integration test;
- AI invented reward -> semantic validator test.

## 20. Definition of Done

A gameplay feature is not complete because it works once manually.

It is complete when:
- deterministic rules have unit coverage;
- persistence changes have integration coverage;
- API schema/error behavior is tested;
- AI behavior can be exercised using fakes;
- critical user-visible path is covered by E2E when appropriate;
- failure/retry behavior has been considered.