# AGENTS.md

This file defines mandatory engineering rules for AI coding agents and human contributors working on Isekai Life RPG.

## 1. Mission

Build Isekai Life RPG as a real persistent browser RPG, not as a thin UI over an LLM.

The project must preserve a strict separation between:

- deterministic game rules;
- persistent game state;
- API transport;
- AI-generated narrative;
- presentation/UI.

## 2. Non-Negotiable Architecture Rules

### 2.1 Server authority

The backend is the source of truth for:

- character stats;
- HP/MP;
- XP and levels;
- inventory;
- equipment;
- currency;
- skill unlocks;
- quest state;
- companion state;
- reputation;
- world state;
- turn number;
- save state;
- game-over state.

Never trust these values when received from the browser.

### 2.2 AI is not authoritative

LLM output is untrusted content.

AI may propose:

- narrative;
- dialogue;
- scene descriptions;
- candidate choices;
- quest flavor;
- NPC personality text;
- visual/audio prompts.

AI must not directly decide persisted numerical state without deterministic validation.

Every AI response must be parsed against a schema and passed through a game-domain validator before use.

### 2.3 Explicit boundaries

Keep these concepts separate:

```text
API controller -> application service -> game engine -> repository
                                      -> AI orchestration
```

Do not place database calls, prompt construction, and game rules in one controller function.

## 3. Target Modules

Prefer this target structure when adding new backend code:

```text
apps/api/src/
  app.ts
  server.ts
  modules/
    auth/
    characters/
    sessions/
    turns/
    quests/
    combat/
    companions/
    inventory/
    world/
    ai/
  infrastructure/
    db/
    redis/
    queue/
    telemetry/

packages/game-core/src/
  combat/
  progression/
  inventory/
  checks/
  quests/
  world/
  companions/

packages/contracts/src/
  api/
  schemas/
  events/
```

Do not force this migration in one giant PR. Move one bounded feature at a time.

## 4. Code Standards

- TypeScript strict mode is required.
- Avoid `any` unless bridging an untyped external boundary; isolate and validate it immediately.
- Public functions require clear types.
- Domain models must not import Express, Prisma, Gemini, React, or browser APIs.
- Shared contracts must be serializable and versionable.
- Prefer pure functions in game logic.
- Prefer dependency injection for time, random number generation, IDs, repositories, and AI providers.
- Do not use `Math.random()` directly inside critical game rules. Use an injected RNG.
- Store timestamps in UTC.
- Use UUIDs or another collision-safe server-generated identifier.

## 5. API Rules

- All mutating endpoints require input validation.
- Use Zod or an equivalent schema library.
- Return stable error codes in addition to human-readable messages.
- Do not expose stack traces to clients.
- Use request IDs/correlation IDs.
- Use idempotency keys for turn submissions and other expensive mutations.
- Implement rate limits for AI-backed endpoints.
- Never accept complete game state from the client as authoritative input.

Example turn request:

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

Not allowed:

```json
{
  "hp": 999999,
  "level": 9000,
  "inventory": ["legendary sword"]
}
```

## 6. Database Rules

- PostgreSQL is the default persistent database.
- Use migrations for all schema changes.
- Never edit an already-applied migration to change production behavior.
- Use transactions around complete turn resolution.
- Preserve a turn/event history sufficient to audit and reconstruct important state changes.
- Prefer soft deletion for important player content.
- Add indexes intentionally and document high-cardinality/query-critical indexes.

## 7. AI Provider Rules

All provider-specific SDK types must remain behind a project-owned interface.

Target interface concept:

```ts
interface AIProvider {
  generateStructured<T>(request: AIRequest<T>): Promise<AIResponse<T>>;
}
```

Required characteristics:

- provider timeout;
- retry policy;
- model fallback policy;
- token/usage metadata;
- schema validation;
- prompt version tracking;
- safe logging without secrets or private raw prompts by default;
- deterministic fallback path when AI is unavailable.

Never hard-code an unreleased or unverified model name as the only execution path.

## 8. Prompt Engineering Rules

Prompts are versioned application assets.

Each major prompt should define:

- prompt ID;
- prompt version;
- allowed inputs;
- output schema;
- model capabilities required;
- safety constraints;
- maximum context strategy;
- fallback behavior.

Do not concatenate unlimited player history into every request.

Use layered memory:

1. current scene;
2. active quest context;
3. active companions;
4. recent turn summaries;
5. retrieved long-term memories;
6. world facts relevant to the current scene.

## 9. Gameplay Rules

Any important mechanic must have deterministic rules and tests.

Examples:

- XP gain;
- level-up thresholds;
- damage calculation;
- critical chance;
- skill costs;
- cooldowns;
- item consumption;
- relationship thresholds;
- quest transitions;
- reputation changes;
- death/game-over conditions;
- reward generation boundaries.

Narrative may explain a result, but cannot silently override the rule result.

## 10. Content Design Rules

Every feature must reinforce at least one player motivation:

- discovery;
- power progression;
- identity/roleplay;
- relationships;
- mastery;
- collection;
- long-term consequences.

Avoid adding disconnected mechanics only because they are common in RPGs.

## 11. Testing Requirements

For backend/game changes, add tests at the correct layer.

Minimum expectations:

- unit tests for deterministic rules;
- contract tests for APIs;
- repository/integration tests with PostgreSQL when persistence changes;
- AI adapter tests using deterministic fakes;
- end-to-end tests for critical player flows.

Critical E2E flows:

1. create character;
2. start game;
3. complete several turns;
4. use an item;
5. unlock progression;
6. save/reload;
7. finish or fail a quest;
8. recover correctly after duplicate turn submission.

## 12. Security Rules

- Secrets stay server-side.
- `.env` files are never committed.
- Validate custom player actions before including them in AI prompts.
- Treat AI output as hostile/untrusted input.
- Prevent prompt output from generating executable HTML/JS.
- Escape/sanitize rich text before rendering.
- Add authentication before public persistent saves are released.
- Avoid logging private credentials, authorization headers, or full secret-bearing payloads.

See `docs/SECURITY.md`.

## 13. Docker Rules

The target local environment must start with:

```bash
docker compose up --build
```

Containers must have health checks where practical.

The application must not rely on services running manually on the host except Docker itself.

## 14. Pull Request Discipline

Each PR should implement one coherent milestone or vertical slice.

PR descriptions should include:

- problem;
- solution;
- architecture impact;
- database changes;
- API changes;
- security considerations;
- tests run;
- follow-up work.

Avoid PRs that mix large UI redesigns, database migrations, game balancing, and AI orchestration changes unless required for one vertical slice.

## 15. Definition of Done

A feature is done only when:

- code is implemented;
- types are correct;
- input/output schemas exist;
- tests pass;
- persistence behavior is understood;
- error behavior is implemented;
- documentation is updated;
- secrets are not exposed;
- game-state authority is preserved;
- the feature is playable through a user-visible flow when applicable.

## 16. Priority Rule

When choosing between adding more generated content and improving game-state integrity, choose integrity first.

A smaller deterministic game with reliable saves and meaningful consequences is more valuable than a huge AI-generated world whose state cannot be trusted.