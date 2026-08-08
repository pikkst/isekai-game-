# Game Design

## 1. Design Goal

Create a browser RPG where AI increases variety and narrative responsiveness, while deterministic systems preserve fairness, progression, continuity and player trust.

The game should feel like a living campaign with RPG systems, not a sequence of unrelated generated scenes.

## 2. Core Player Loop

Each turn follows this conceptual sequence:

1. Read the current scene and objective.
2. Inspect relevant stats, companions, resources and risks.
3. Choose a predefined action or submit a bounded custom action.
4. Backend validates the action.
5. Deterministic systems resolve checks, combat, costs and rewards.
6. AI Game Master narrates those facts and produces bounded next-scene options.
7. Backend validates AI output and persists the completed turn.
8. UI updates story, map, quest log, progression and relationships.

## 3. Character Creation

Character creation should be expressive without forcing a complex rules tutorial.

Initial dimensions:
- name;
- language;
- world archetype;
- reincarnation method;
- cheat skill;
- starting stat allocation;
- optional custom world description;
- optional custom cheat concept.

Future dimensions:
- origin trait;
- personality tags;
- difficulty mode;
- pronouns/avatar presentation;
- starting vow or ambition.

Custom text must be treated as flavor/request input, not as permission to create unlimited mechanical power.

## 4. Stats

Recommended primary stats:

- **STR** — physical damage, carrying power, toughness checks.
- **MAG** — spell effectiveness, magical resistance, mana scaling.
- **AGI** — initiative, evasion, precision, stealth.
- **LUK** — rare events, critical modifiers, loot and fate interactions.

Derived stats can include:
- Max HP;
- Max MP;
- Attack;
- Defense;
- Magic Power;
- Resistance;
- Accuracy;
- Evasion;
- Critical Chance;
- Initiative.

Derived values must be computed by `game-core`, not persisted independently unless caching is justified.

## 5. Progression

Character progression should create build identity.

Sources:
- XP from quests and meaningful encounters;
- level-up stat points;
- skill points;
- equipment;
- titles;
- faction bonuses;
- companion synergy;
- rare artifacts;
- cheat-skill evolution.

Avoid grinding as the primary progression method. Reward meaningful decisions and completed objectives.

## 6. Cheat Skills

Cheat skills are a defining Isekai mechanic.

Design requirements:
- each cheat has a clear fantasy;
- each changes available strategies;
- power can be asymmetric;
- rules still define activation and effects;
- repeated use may have cooldown, resource, exposure or narrative consequences;
- high-tier use can escalate world response.

Example archetypes:
- analysis/appraisal;
- time manipulation;
- dimensional storage;
- creation/crafting;
- devour/evolution;
- divine healing;
- shadow movement;
- command/domination;
- probability manipulation.

## 7. Skills

Skills should be data-driven definitions interpreted by deterministic handlers.

A skill definition may include:
- ID;
- name;
- category;
- resource cost;
- cooldown;
- required level;
- prerequisites;
- target rules;
- effect operations;
- tags;
- upgrade path.

Do not encode every skill as unique controller code when reusable effect primitives can represent it.

## 8. Combat

Combat should provide meaningful decisions without becoming a full tactical MMO simulation.

Core combat actions:
- basic attack;
- skill;
- defend;
- item;
- companion command/support;
- flee;
- special/contextual action.

Combat resolution should support:
- initiative order;
- hit/evade;
- damage;
- criticals;
- defense/resistance;
- buffs/debuffs;
- status effects;
- resource costs;
- cooldowns;
- enemy AI policy;
- surrender/flee;
- victory/defeat.

AI receives the combat result as facts and writes the cinematic narration afterward.

## 9. Quests

Quests are state machines, not just text prompts.

Each quest should define:
- quest ID;
- category;
- prerequisites;
- stages;
- objectives;
- transitions;
- failure conditions;
- rewards;
- world-state changes;
- NPC/faction consequences.

AI may generate dialogue and flavor around a quest, but completion must depend on explicit objective rules.

## 10. Exploration and World Map

World structure should begin as a graph rather than a fully simulated coordinate map.

A location has:
- ID;
- region;
- name;
- tags;
- danger rating;
- faction ownership;
- discovered status;
- connected locations;
- available activities;
- encounter tables/director metadata.

Travel can consume time/resources or trigger encounters later.

## 11. World State

Persistent global variables may include:
- threat level;
- chaos level;
- faction wars;
- ruler status;
- destroyed/saved settlements;
- important NPC status;
- active calamities;
- discovered secrets;
- world clock.

The world should react to major player decisions through explicit state transitions.

## 12. Factions

Faction gameplay creates political consequence.

Each faction has:
- identity;
- ideology/goals;
- allies/enemies;
- controlled regions;
- reputation thresholds;
- ranks;
- rewards;
- quest pools.

Reputation should gate:
- dialogue;
- shops;
- quests;
- safe access;
- faction-specific endings;
- NPC reactions.

## 13. NPCs

Important NPCs require persistent identity.

Persist:
- traits;
- goals;
- fears;
- faction;
- relationship values;
- known facts;
- memories;
- location/status;
- quest roles.

Minor NPCs may be procedural and ephemeral, but once promoted into a recurring role they should receive a persistent canonical record.

## 14. Companions

Companions are mechanically and narratively significant.

Systems:
- recruitment;
- party membership;
- loyalty;
- affection;
- trust;
- level;
- abilities;
- equipment later;
- personal quests;
- preferences;
- conflicts;
- departure/betrayal/death.

Companion dialogue should reference persistent memories and current relationship state.

## 15. Romance

Romance must be state-driven.

Possible relationship stages:
- stranger;
- ally;
- companion;
- trusted confidante;
- romantic interest;
- beloved;
- bonded/soulmate.

Major stage changes require meaningful events, not only generated dialogue.

## 16. Inventory and Equipment

Item categories:
- consumable;
- weapon;
- armor;
- accessory;
- material;
- quest item;
- artifact;
- key item.

Important properties:
- ID;
- rarity;
- stackability;
- max stack;
- effects;
- value;
- tags;
- binding/quest restrictions.

## 17. Economy

Economy should support progression but not dominate the game.

Early systems:
- gold/common currency;
- merchant inventories;
- buy/sell prices;
- scarcity modifiers;
- quest rewards.

Later systems:
- faction currencies;
- crafting materials;
- region-based prices;
- rare auction/event merchants.

## 18. Karma and Alignment

Karma is not simply "good vs evil." It can influence:
- divine/demonic events;
- NPC reactions;
- quest availability;
- endings;
- skill evolution;
- world response.

Major moral decisions should also store explicit world flags rather than relying only on one numeric karma score.

## 19. Fate Points

Fate Points are a scarce meta-resource within a run.

Potential uses:
- reroll a critical check;
- avoid lethal defeat;
- trigger a miracle;
- reveal a hidden option;
- resist a catastrophic consequence.

Their use must be validated and persisted server-side.

## 20. Story Memory

The game should distinguish state from narrative memory.

Examples of persistent memories:
- promise to an NPC;
- companion rescue;
- betrayal;
- boss defeat;
- discovered parentage;
- secret identity;
- destroyed city;
- romantic milestone.

Memory entries should have category, importance and related entity IDs.

## 21. Narrative Pacing

A Narrative Director should balance:
- action;
- exploration;
- social scenes;
- mystery;
- downtime;
- climax.

It should avoid patterns such as combat every turn or endless low-stakes dialogue.

## 22. Endings

Endings must be derived from persistent state.

Candidate categories:
- heroic victory;
- ascension;
- ruler/kingdom ending;
- demon-lord ending;
- peaceful retirement;
- sacrifice;
- corruption;
- faction ending;
- companion-specific ending;
- secret ending.

## 23. Difficulty

Initial release may use one tuned default difficulty.

Later modes:
- Story — forgiving resources and recovery;
- Standard — intended balance;
- Veteran — harder checks and combat;
- Hardcore — limited recovery/permadeath rules.

Difficulty changes deterministic rules, not just AI wording.

## 24. Content Generation Boundaries

AI is appropriate for:
- prose;
- dialogue;
- scene variants;
- names;
- descriptions;
- optional rumors;
- presentation metadata.

AI is not the authority for:
- player inventory;
- XP;
- stats;
- currency;
- cooldowns;
- quest completion;
- relationship stages;
- permanent world-state transitions.

## 25. Vertical Slice Definition

The first strong playable slice should allow:

1. create a character;
2. enter one region;
3. meet one persistent companion;
4. accept a quest;
5. explore two or three locations;
6. fight at least one deterministic combat encounter;
7. make one reputation-affecting choice;
8. receive progression and loot;
9. complete/fail the quest;
10. close and reload the browser;
11. continue from the exact persisted state;
12. reach one of at least two outcomes.

This vertical slice should be polished before adding many more worlds or mechanics.