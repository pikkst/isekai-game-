# API Specification

## 1. API Goals

The API is a stable boundary between the browser and the authoritative game backend.

It must:
- expose only client-safe projections;
- validate all input at runtime;
- authenticate ownership where required;
- protect state-changing operations with idempotency/concurrency controls;
- use stable error codes;
- avoid leaking persistence/provider implementation details.

Base path target:

```text
/api/v1
```

## 2. Conventions

### Content type

```text
Content-Type: application/json
```

### IDs

Use opaque server-generated IDs. Clients must not infer semantics from them.

### Timestamps

Use ISO-8601 UTC strings.

### Errors

Recommended envelope:

```json
{
  "error": {
    "code": "ACTION_NOT_ALLOWED",
    "message": "That action is not available in the current scene.",
    "requestId": "...",
    "details": {}
  }
}
```

`details` must never contain secrets or internal stack traces.

## 3. Authentication

Future authenticated requests use a secure session/cookie or standard bearer token depending on the chosen identity architecture.

Authorization checks are always server-side.

Character/session IDs are not authorization credentials.

## 4. Health

### GET `/health/live`

Returns process liveness.

### GET `/health/ready`

Returns readiness for gameplay traffic and verifies critical dependencies.

These may live outside `/api/v1`.

## 5. Character APIs

### POST `/api/v1/characters`

Creates a player character profile or character associated with a new run, depending on final product model.

Example request:

```json
{
  "name": "Villu",
  "language": "et",
  "worldArchetype": "high_fantasy",
  "reincarnationMethod": "goddess_summon",
  "cheatSkillId": "divine_appraisal",
  "initialStats": {
    "str": 10,
    "mag": 14,
    "agi": 8,
    "luk": 8
  }
}
```

Server validates total allocation and preset IDs.

### GET `/api/v1/characters`

Returns current user's characters/summaries.

### GET `/api/v1/characters/:characterId`

Returns a character profile projection if owned by the caller.

## 6. Session APIs

### POST `/api/v1/sessions`

Starts a new game session/run.

Example request:

```json
{
  "characterId": "uuid",
  "scenarioId": "classic-isekai-v1"
}
```

Response includes the authoritative initial session projection.

### GET `/api/v1/sessions`

Returns save/run summaries.

Example summary:

```json
{
  "id": "uuid",
  "characterName": "Villu",
  "status": "ACTIVE",
  "level": 7,
  "location": {
    "id": "loc_moonfall",
    "name": "Moonfall Village"
  },
  "turnNumber": 42,
  "updatedAt": "2026-08-08T16:00:00.000Z"
}
```

### GET `/api/v1/sessions/:sessionId`

Loads the complete client-safe current game projection.

### POST `/api/v1/sessions/:sessionId/archive`

Archives a run. Exact deletion semantics should be separate.

## 7. Turn API

### POST `/api/v1/sessions/:sessionId/turns`

This is the primary narrative/action endpoint.

Headers may include an idempotency key, or it may be explicit in body. Pick one consistent convention.

Example body:

```json
{
  "expectedVersion": 42,
  "idempotencyKey": "00c51ec8-...",
  "action": {
    "type": "choice",
    "choiceId": "choice_03"
  }
}
```

Example custom action:

```json
{
  "expectedVersion": 42,
  "idempotencyKey": "...",
  "action": {
    "type": "custom",
    "text": "I try to distract the guard by pretending to be a royal inspector."
  }
}
```

The request must never include authoritative current HP, XP, inventory, level or world state.

### Successful response

Return a full or delta-based authoritative projection. For early implementation, a full bounded projection is simpler and safer.

Example:

```json
{
  "session": {
    "id": "uuid",
    "version": 43,
    "turnNumber": 43,
    "status": "ACTIVE"
  },
  "scene": {
    "location": {
      "id": "loc_castle_gate",
      "name": "Aetheria Castle Gate"
    },
    "narrative": "...",
    "presentation": {
      "mood": "tense"
    },
    "choices": [
      {
        "id": "choice_01",
        "text": "Show the forged seal.",
        "type": "diplomacy",
        "risk": "moderate"
      }
    ]
  },
  "character": {},
  "quests": [],
  "companions": [],
  "inventory": [],
  "events": []
}
```

## 8. Specialized Action APIs

A design decision is required between routing all state changes through `/turns` versus dedicated endpoints.

Recommended rule:
- narrative/world-advancing actions use `/turns`;
- pure management actions that do not advance the story may use dedicated endpoints.

Examples:

### POST `/api/v1/sessions/:sessionId/inventory/:entryId/use`

Use a consumable outside combat if rules allow.

### POST `/api/v1/sessions/:sessionId/equipment`

```json
{
  "expectedVersion": 42,
  "inventoryEntryId": "uuid",
  "slot": "WEAPON"
}
```

### DELETE `/api/v1/sessions/:sessionId/equipment/:slot`

Unequips an item.

### POST `/api/v1/sessions/:sessionId/skills/:skillId/unlock`

Unlocks a skill if prerequisites and skill points are valid.

These endpoints still require concurrency/version protection.

## 9. Quest APIs

### GET `/api/v1/sessions/:sessionId/quests`

Optional query:

```text
?status=ACTIVE
```

### GET `/api/v1/sessions/:sessionId/quests/:questId`

Returns quest journal projection, discovered objectives and relevant visible history.

Acceptance/abandon actions may either be explicit endpoints or turn actions depending on design.

## 10. World APIs

### GET `/api/v1/sessions/:sessionId/world/map`

Returns only discovered/visible world map data.

Must not leak secret locations.

### GET `/api/v1/sessions/:sessionId/world/factions`

Returns discovered factions and player-visible reputation.

## 11. Companion APIs

### GET `/api/v1/sessions/:sessionId/companions`

Returns known/recruited companion projections.

### GET `/api/v1/sessions/:sessionId/companions/:companionId`

Returns player-visible relationship, combat and memory summary.

Hidden NPC goals/secret state must not be leaked.

## 12. Hall of Fame / Run History

Once server persistence exists:

### GET `/api/v1/run-history`

Returns completed run summaries owned by the player.

LocalStorage should no longer be the source of truth for permanent Hall of Fame data.

## 13. Streaming

Potential endpoint:

```text
GET /api/v1/sessions/:sessionId/turns/:turnId/stream
```

or a WebSocket channel.

The stream may emit:
- generation started;
- narrative token/chunk;
- scene metadata ready;
- turn completed;
- retryable failure.

The final authoritative state must still come from a validated completed turn result.

## 14. Pagination

Use cursor pagination for potentially large histories.

Examples:
- turn history;
- memories;
- completed quests;
- run history.

Avoid unbounded arrays in APIs.

## 15. Version Conflicts

When the client submits stale `expectedVersion`, return HTTP 409.

Example:

```json
{
  "error": {
    "code": "SESSION_VERSION_CONFLICT",
    "message": "The game state changed before this action was applied.",
    "requestId": "...",
    "details": {
      "currentVersion": 43
    }
  }
}
```

Client should refresh authoritative state rather than retrying with guessed values.

## 16. Validation

Every request gets runtime validation.

Validate:
- IDs;
- enum values;
- string lengths;
- stat allocation ranges;
- custom action maximum length;
- idempotency key shape;
- expected version;
- nested union types.

Runtime validation is required even when TypeScript types exist.

## 17. Rate Limiting

Return HTTP 429 with stable error code `RATE_LIMITED`.

Where useful include a retry-after hint.

AI generation should also have per-session concurrency protection.

## 18. Contract Ownership

Schemas and types belong in `packages/contracts`.

The client and API import the same versioned project-owned contract definitions.

Provider models, Prisma records and internal domain objects must not be serialized directly as public API responses.

## 19. API Evolution

Breaking changes require either:
- `/api/v2`; or
- backward-compatible contract versioning with an explicit deprecation plan.

During pre-alpha, changes may be faster, but contract boundaries should still be intentional.