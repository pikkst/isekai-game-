# Database Design

## 1. Database Choice

PostgreSQL is the primary durable store.

Reasons:
- transactional consistency for turn resolution;
- strong relational modeling for characters, quests, inventory and NPC relationships;
- mature indexing and JSON support;
- reliable migrations and backups;
- good Prisma support.

Redis is complementary and must not replace PostgreSQL for durable player progress.

## 2. Modeling Principles

- distinguish immutable definitions from player/world instances;
- store authoritative current state in normalized tables;
- preserve turn/event history for audit and recovery;
- use explicit foreign keys;
- use database constraints for invariants where practical;
- store UTC timestamps;
- prefer UUID primary keys for player/runtime entities;
- version mutable sessions for concurrency control;
- do not persist provider SDK objects directly.

## 3. Core Entity Overview

```text
User
 └── Character
      └── GameSession
           ├── CharacterState
           ├── GameTurn
           ├── InventoryEntry
           ├── EquipmentState
           ├── SkillUnlock
           ├── QuestInstance
           ├── CompanionState
           ├── FactionStanding
           ├── StoryMemory
           ├── WorldState
           └── IdempotencyRecord
```

## 4. User

Suggested fields:
- `id` UUID;
- `email` or external identity reference when authentication exists;
- `displayName` optional;
- `createdAt`;
- `updatedAt`;
- `deletedAt` optional.

For early anonymous MVP, a temporary owner/session concept may be used, but schema design should not make account ownership impossible later.

## 5. Character

Represents player identity independent of one active campaign if the product later supports multiple runs.

Suggested fields:
- `id`;
- `userId`;
- `name`;
- `language`;
- `originPresetId` optional;
- `avatarUrl` optional;
- `createdAt`;
- `archivedAt` optional.

## 6. GameSession

Represents one campaign/run.

Suggested fields:
- `id`;
- `characterId`;
- `scenarioId`;
- `status`: `ACTIVE | COMPLETED | FAILED | ARCHIVED`;
- `version` integer;
- `turnNumber` integer;
- `currentLocationId`;
- `currentArcId` optional;
- `endingType` optional;
- `startedAt`;
- `updatedAt`;
- `completedAt` optional.

Indexes:
- `(characterId, status)`;
- `(updatedAt)` for recent saves;
- optional `(userId, updatedAt)` through direct relation or query join.

## 7. CharacterState

One current authoritative state row per session.

Fields may include:
- `sessionId` unique;
- `level`;
- `xp`;
- `hp`;
- `mp`;
- `str`;
- `mag`;
- `agi`;
- `luk`;
- `statPoints`;
- `skillPoints`;
- `karma`;
- `fatePoints`;
- `titleId` optional;
- `updatedAt`.

Derived values such as max HP should generally be calculated from rules/definitions unless persistence is needed for version compatibility.

## 8. GameTurn

Append-oriented record of completed or attempted turns.

Suggested fields:
- `id`;
- `sessionId`;
- `turnNumber`;
- `status`;
- `idempotencyKey`;
- `actionType`;
- `actionPayload` JSONB;
- `resolutionFacts` JSONB;
- `narrative` text;
- `sceneMetadata` JSONB;
- `promptId` optional;
- `promptVersion` optional;
- `aiProvider` optional;
- `aiModel` optional;
- `aiUsage` JSONB optional;
- `createdAt`;
- `completedAt` optional.

Constraints:
- unique `(sessionId, turnNumber)` for completed turn sequence;
- unique `(sessionId, idempotencyKey)`.

## 9. InventoryEntry

Suggested fields:
- `id`;
- `sessionId`;
- `itemDefinitionId`;
- `quantity`;
- `metadata` JSONB for bounded generated modifiers later;
- `acquiredTurnId` optional;
- `createdAt`;
- `updatedAt`.

Constraints/indexes:
- positive quantity;
- index `(sessionId, itemDefinitionId)`;
- uniqueness policy depends on whether unique item instances are supported.

## 10. EquipmentState

Possible normalized representation:
- `sessionId`;
- `slot`;
- `inventoryEntryId`;
- unique `(sessionId, slot)`;
- unique inventory entry if one item cannot occupy multiple slots.

## 11. SkillUnlock

Fields:
- `id`;
- `sessionId`;
- `skillDefinitionId`;
- `rank`;
- `cooldownUntilTurn` optional;
- `unlockedAtTurn`;
- `createdAt`.

Unique `(sessionId, skillDefinitionId)`.

## 12. QuestInstance

Fields:
- `id`;
- `sessionId`;
- `questDefinitionId` or generated quest definition reference;
- `status`;
- `currentStage`;
- `objectiveProgress` JSONB;
- `acceptedAtTurn`;
- `completedAtTurn` optional;
- `failedAtTurn` optional;
- `metadata` JSONB optional.

Indexes:
- `(sessionId, status)`;
- `(sessionId, questDefinitionId)`.

## 13. NPC and Companion Model

### NpcInstance

For persistent recurring NPC identity:
- `id`;
- `sessionId`;
- `npcDefinitionId` optional;
- `name`;
- `role`;
- `factionId` optional;
- `currentLocationId` optional;
- `status`;
- `traits` JSONB;
- `goals` JSONB;
- `metadata` JSONB.

### CompanionState

For recruited/important companion mechanics:
- `id`;
- `sessionId`;
- `npcInstanceId`;
- `partyStatus`;
- `level`;
- `xp`;
- `loyalty`;
- `affection`;
- `trust`;
- `relationshipStage`;
- `updatedAt`.

Unique `(sessionId, npcInstanceId)`.

## 14. FactionStanding

Fields:
- `sessionId`;
- `factionDefinitionId`;
- `standing`;
- `rank` optional;
- `updatedAt`.

Unique `(sessionId, factionDefinitionId)`.

## 15. WorldState

One current row per session or scenario shard.

Suggested fields:
- `sessionId` unique;
- `worldName`;
- `worldClock`;
- `threatLevel`;
- `chaosLevel`;
- `flags` JSONB;
- `activeGlobalEvents` JSONB or normalized table later;
- `updatedAt`.

Important world facts should become explicit fields/tables when they are queried frequently or enforce mechanics.

## 16. Location Discovery

Suggested table:

`DiscoveredLocation`
- `sessionId`;
- `locationDefinitionId`;
- `discoveredAtTurn`;
- `visitCount`;
- `lastVisitedAtTurn`.

Unique `(sessionId, locationDefinitionId)`.

## 17. StoryMemory

Fields:
- `id`;
- `sessionId`;
- `turnId` optional;
- `category`;
- `importance`;
- `title`;
- `summary`;
- `subjectEntityIds` JSONB or normalized relation later;
- `tags` array/JSONB;
- `createdAt`.

Indexes:
- `(sessionId, importance)`;
- `(sessionId, category)`;
- `(sessionId, createdAt)`.

Semantic/vector retrieval should be added only when simpler retrieval becomes insufficient.

## 18. DomainEvent

Optional but recommended append-only event table.

Fields:
- `id`;
- `sessionId`;
- `turnId` optional;
- `eventType`;
- `payload` JSONB;
- `createdAt`.

Useful for:
- achievements;
- analytics;
- auditing;
- downstream memory generation;
- future event-driven features.

## 19. IdempotencyRecord

Fields:
- `id`;
- `sessionId`;
- `key`;
- `requestHash`;
- `status`;
- `responseStatus` optional;
- `responseBody` JSONB optional;
- `createdAt`;
- `expiresAt` optional.

Unique `(sessionId, key)`.

A reused key with a different request hash must be rejected.

## 20. Definition Data

Definitions may initially live in version-controlled JSON/TypeScript:
- items;
- skills;
- enemies;
- factions;
- locations;
- quest templates;
- scenario configuration.

Each definition needs a stable ID and schema version.

Runtime rows reference stable definition IDs.

## 21. Generated Definitions

If AI eventually creates durable generated quests/items/NPC templates, persist them separately from runtime instances and validate them before use.

Recommended generated definition metadata:
- generated definition ID;
- schema version;
- source/provider;
- prompt version;
- approved/validation status;
- canonical structured fields.

## 22. JSONB Policy

JSONB is useful for evolving metadata but should not become an excuse to store the entire game as one document.

Use normalized columns/tables for:
- ownership;
- state used in core rules;
- values that need constraints;
- frequent query/filter fields;
- concurrency/versioning fields.

Use JSONB for:
- low-frequency metadata;
- provider usage metadata;
- structured narrative presentation;
- bounded extensible attributes.

## 23. Transactions

Turn commit may touch:
- GameSession;
- CharacterState;
- GameTurn;
- InventoryEntry;
- QuestInstance;
- CompanionState;
- FactionStanding;
- DomainEvent;
- StoryMemory.

All changes representing one committed turn must be atomic or follow an explicitly recoverable state machine.

## 24. Migration Policy

- every schema change gets a new migration;
- never mutate a migration already deployed to shared/staging/production environments;
- migrations are reviewed with application changes;
- destructive changes require a data migration/backfill plan;
- production deploys run migrations in a controlled step.

## 25. Backups

Production plan should include:
- automated PostgreSQL backups;
- retention policy;
- restoration test;
- documented recovery procedure;
- infrastructure-level encrypted storage.

A backup that has never been restoration-tested is not a complete backup strategy.

## 26. Data Retention and Deletion

Define before public launch:
- account deletion behavior;
- save deletion/archive behavior;
- analytics retention;
- AI prompt/response logging retention;
- operational log retention.

Avoid permanently storing unnecessary raw user free-text when a structured/summarized representation is sufficient.