# Product Vision

## 1. Product Statement

Isekai Life RPG is a persistent AI-assisted browser RPG where every run creates a personal fantasy life rather than a sequence of disconnected chat messages.

The player is reincarnated into a living world, develops a build, forms relationships, chooses factions, completes quests, discovers secrets, fights enemies, changes the world, and eventually reaches one of many state-driven endings.

The product should feel closer to a lightweight single-player RPG / visual novel / roguelite campaign than an AI chatbot.

## 2. Player Promise

The player should believe:

> My decisions matter, the world remembers them, my character becomes uniquely mine, and the story can go somewhere I did not expect without losing internal consistency.

## 3. Product Pillars

### 3.1 Persistent consequence

Choices create durable consequences.

Examples:
- an NPC remembers betrayal;
- a faction becomes hostile;
- a town is destroyed or saved;
- a companion can leave permanently;
- a quest can fail rather than silently reset;
- a political decision changes later encounters;
- a powerful cheat ability can attract stronger enemies.

### 3.2 Power fantasy with resistance

Isekai stories often promise unusual power. The game should support that fantasy without eliminating gameplay.

Cheat skills should:
- feel spectacular;
- solve problems in unusual ways;
- create new strategic options;
- sometimes create costs, visibility, cooldowns, narrative consequences, or stronger opposition.

The design target is not perfect balance between all builds. The target is meaningful decisions despite asymmetrical power.

### 3.3 Character identity

A run should create a recognizable character identity through:
- origin;
- world archetype;
- reincarnation method;
- cheat skill;
- stat build;
- skills;
- equipment;
- titles;
- karma;
- faction standing;
- relationships;
- important decisions;
- ending.

### 3.4 Relationship-driven storytelling

Companions and recurring NPCs are core systems, not decoration.

Important NPCs must have persistent:
- identity;
- goals;
- traits;
- memories;
- relationship state;
- location/status;
- personal quest state.

### 3.5 Discovery

The world should continuously reveal:
- hidden locations;
- monsters;
- factions;
- lost civilizations;
- artifacts;
- magic systems;
- secrets about the player's reincarnation;
- optional endings.

### 3.6 Systemic replayability

Replay value comes from combinations of:
- different world archetypes;
- different reincarnation methods;
- different cheat skills;
- procedural encounters;
- branching quests;
- faction choices;
- companion combinations;
- build choices;
- world events;
- multiple endings.

## 4. Target Experience

A successful 30–60 minute session should usually include several of the following:
- meaningful story progression;
- one tactical or skill-based challenge;
- one discovery;
- progression reward;
- relationship development;
- a consequence from an earlier decision;
- a new decision that creates anticipation for the next session.

## 5. Core Loop

```text
Explore / receive scene
        ↓
Understand current objective and risks
        ↓
Choose action, dialogue, skill or travel
        ↓
Game engine validates and resolves mechanics
        ↓
AI Game Master narrates the resolved outcome
        ↓
Persist state, memories and consequences
        ↓
Receive progression / new hooks / choices
        ↓
Continue or save and return later
```

## 6. Meta Loop

Across a full run:

```text
Reincarnation
  -> survival
  -> first allies/enemies
  -> build identity
  -> regional influence
  -> faction / companion commitments
  -> major world conflict
  -> climax
  -> ending
  -> achievements / codex / optional New Game+
```

## 7. Audience

Primary audience:
- players who enjoy isekai/anime fantasy;
- interactive fiction and visual novels;
- RPG progression;
- character relationships;
- emergent stories;
- AI-generated personalized content.

Secondary audience:
- players who enjoy roguelite experimentation;
- buildcrafting;
- fantasy sandbox choices;
- story sharing.

## 8. MVP Definition

The MVP is not "all features working." It is the smallest version that proves a persistent AI RPG is fun.

MVP must include:
- character creation;
- one high-fantasy world scenario;
- server-authoritative save;
- persistent game session;
- deterministic progression;
- inventory/equipment basics;
- deterministic combat v1;
- quest engine v1;
- several persistent NPCs/companions;
- AI narrative around deterministic results;
- layered story memory;
- save/resume;
- at least two meaningful endings;
- desktop and mobile browser usability.

MVP does not require:
- multiplayer;
- user-generated worlds;
- crafting depth;
- advanced economy simulation;
- dozens of world archetypes;
- fully generated images for every scene;
- voice acting;
- native mobile application.

## 9. Product Success Criteria

Engineering success:
- no client-authoritative progression;
- durable saves;
- recoverable AI failures;
- reproducible game rules;
- bounded AI context and cost;
- observable turn pipeline.

Game success:
- players can explain what makes their run unique;
- earlier choices affect later scenes;
- progression changes available strategies;
- recurring NPCs remain consistent;
- player can fail, recover, or reach distinct endings;
- replaying with a different build/world creates materially different experiences.

## 10. Anti-Goals

Do not optimize for:
- maximum AI text length;
- infinite choices with no consequences;
- a pure roleplay chat box;
- arbitrary LLM-generated stats;
- every RPG mechanic at once;
- photorealistic graphics as a prerequisite for fun;
- blockchain/NFT mechanics;
- pay-to-win progression.

## 11. Long-Term Vision

The long-term platform can support multiple scenario packs on one shared RPG engine.

Examples:
- classic hero reincarnation;
- demon-lord route;
- monster evolution;
- cyberpunk cultivation;
- otome academy;
- post-apocalyptic magic;
- kingdom builder;
- dungeon core.

Each scenario should reuse the same foundations: characters, quests, combat, relationships, memory, AI orchestration, world state and persistence.