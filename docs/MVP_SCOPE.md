# MVP Scope

## 1. MVP Goal

Prove that Isekai Life RPG is fun as a persistent AI-assisted RPG, not merely technically possible.

The MVP should demonstrate a complete playable campaign slice with deterministic mechanics, server-owned state, persistent consequences and AI-driven narrative presentation.

## 2. MVP Player Promise

A player can:
- create a distinct reincarnated character;
- enter a coherent fantasy world;
- make meaningful choices;
- fight and progress using real RPG rules;
- meet persistent NPCs and a companion;
- complete/fail quests;
- see consequences persist;
- close the browser and continue later;
- reach one of multiple endings.

## 3. Required Scenario

Ship one polished scenario first:

**Classic High Fantasy Isekai**

Recommended content:
- one starter sanctum/arrival scene;
- one village/town hub;
- one wilderness region;
- one dangerous dungeon/ruin;
- one capital/faction location;
- one major antagonist arc.

Do not build five shallow worlds before one world is compelling.

## 4. Required Character Systems

- name;
- reincarnation method;
- one of several cheat skills;
- STR/MAG/AGI/LUK allocation;
- level/XP;
- HP/MP;
- stat points;
- skill points;
- title;
- karma;
- fate points.

## 5. Required Skills

Minimum:
- basic physical attack;
- basic magic option;
- defense/avoidance action;
- item usage;
- at least 6–10 unlockable skills across several build paths;
- 3+ meaningfully different cheat skills.

## 6. Required Combat

Combat v1 must include:
- initiative;
- HP/MP;
- attack and defense;
- physical/magical damage;
- criticals;
- evade or block;
- skills and cooldown/resource cost;
- enemy turn;
- victory/defeat;
- XP and loot;
- flee where allowed.

Minimum encounter content:
- several normal enemies;
- one elite/miniboss;
- one final/boss encounter.

## 7. Required Inventory

- consumables;
- weapon;
- armor;
- accessory;
- quest items;
- rarity display;
- stackable consumables;
- equip/unequip;
- persisted inventory.

Crafting is not required for MVP.

## 8. Required Quest Content

Minimum quest structure:
- one main quest chain with branching decision;
- 3+ side quests;
- one companion quest;
- one faction/reputation-sensitive quest;
- at least one quest that can fail;
- at least one choice that permanently changes later content.

## 9. Required NPCs

Minimum recurring cast:
- guide/mentor;
- companion;
- merchant/service NPC;
- faction representative;
- rival or antagonist;
- boss/major threat.

They need persistent identities and important state/memories.

## 10. Required Companion System

At least one fully implemented companion with:
- recruitment;
- party presence;
- loyalty/trust;
- affection/relationship state;
- combat support or ability;
- persistent memories;
- personal quest;
- at least two relationship outcomes.

Depth for one companion is preferable to shallow support for ten.

## 11. Required World Systems

- persistent world flags;
- locations and travel graph;
- discovered locations;
- threat/chaos state where useful;
- at least two factions or sides with reputation consequences;
- world-state consequence from main quest.

## 12. Required AI Features

- server-side provider abstraction;
- Gemini adapter;
- deterministic fake provider;
- structured turn output;
- bounded context builder;
- recent-turn memory summaries;
- important long-term memories;
- prompt versioning;
- retry/fallback behavior;
- validation preventing mechanical hallucinations.

Image generation is optional for MVP.

## 13. Required Persistence

PostgreSQL must persist:
- character;
- session;
- current character state;
- turns;
- inventory/equipment;
- skills;
- quests;
- companion relationship;
- important world state;
- story memories.

The browser must not be the only save location.

## 14. Required Browser UX

Main views/panels:
- character creation;
- story/scene view;
- choices/custom action;
- character status;
- inventory/equipment;
- skills;
- quest journal;
- companion panel;
- map or location navigation;
- save/run selection.

The UI must work on desktop and mobile browsers.

## 15. Required Presentation

Minimum atmosphere:
- polished typography/layout;
- scene background support;
- character/companion portrait support;
- music/ambient mood changes;
- combat feedback;
- loading/generation state;
- error/retry UX.

Do not block MVP on expensive bespoke animation or generated video.

## 16. Required Reliability

- server-authoritative state;
- idempotent turn submissions;
- version/concurrency protection;
- AI timeout/retry/fallback;
- no progress loss after refresh;
- no duplicate reward after network retry;
- health/readiness endpoint;
- Docker-based local stack.

## 17. Required Testing

- game-core unit tests;
- PostgreSQL integration tests;
- API contract tests;
- fake-AI turn tests;
- E2E create/play/save/resume flow;
- E2E combat flow;
- duplicate-turn regression test.

## 18. Required Endings

Minimum two clearly distinct endings produced from actual game state.

Recommended first set:
- heroic victory;
- alternative faction/companion or ascension ending.

Defeat is a terminal state but does not substitute for a meaningful alternate successful ending.

## 19. Explicitly Out of Scope for MVP

- real-time multiplayer;
- PvP;
- guilds;
- player marketplace;
- user-authored scenario editor;
- community mods;
- voice acting/TTS for every scene;
- generated video;
- complex crafting;
- housing;
- kingdom simulation;
- dozens of companions;
- global economy;
- native mobile apps;
- leaderboards requiring anti-cheat hardening;
- multiple fully developed scenario worlds.

## 20. MVP Exit Criteria

MVP is complete when an external tester can:

1. create a character;
2. start a new campaign;
3. play at least 30 meaningful turns;
4. complete exploration, dialogue and combat content;
5. recruit/interact with a companion;
6. complete or fail quests;
7. gain levels, skills and items;
8. make a permanent world/faction decision;
9. close the browser and resume later;
10. reach a state-driven ending;
11. replay with another build and experience materially different options/outcomes;
12. do all of this without editing client-side state becoming authoritative.

Only after this vertical slice is stable should the project aggressively expand world archetypes and content volume.