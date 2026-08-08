import type {
  CharacterStats,
  CheatSkill,
  Companion,
  GameTurnResult,
  InventoryItem,
  StartGamePayload,
  StoryMemory,
  WorldState,
} from '@isekai/contracts';
import { applyExperience } from './progression';
import { getSkillImageUrl, getCompanionAvatarUrl } from '@isekai/contracts';

export function createInitialStats(payload: StartGamePayload): CharacterStats {
  const initialStats: CharacterStats = {
    name: payload.characterName,
    title: payload.language === 'et' ? 'Reinkarneerunu' : 'Reincarnated One',
    level: 1,
    exp: 0,
    maxExp: 100,
    hp: 100 + payload.initialStats.str * 2,
    maxHp: 100 + payload.initialStats.str * 2,
    mp: 80 + payload.initialStats.mag * 2,
    maxMp: 80 + payload.initialStats.mag * 2,
    str: payload.initialStats.str,
    mag: payload.initialStats.mag,
    agi: payload.initialStats.agi,
    luk: payload.initialStats.luk,
    karma: 0,
    fatePoints: 3,
  };
  return initialStats;
}

export function findCheatSkillById(
  cheatSkillId: string,
  customCheatPrompt?: string,
): CheatSkill {
  return {
    id: cheatSkillId,
    name: customCheatPrompt || 'Custom Divine Cheat',
    description: customCheatPrompt || 'Unfathomable cheat powers.',
    cooldown: 0,
    type: 'divine',
  };
}

export function generateStarterItems(): InventoryItem[] {
  return [
    {
      id: 'item_starter_blade',
      name: 'Sanctum Sword',
      description: 'A blade forged in mana-infused steel.',
      type: 'weapon',
      count: 1,
    },
    {
      id: 'item_hp_potion',
      name: 'Health Elixir (x2)',
      description: 'Restores 50 HP.',
      type: 'potion',
      count: 2,
    },
  ];
}

export function generateStarterSkills(): Array<{ id: string; name: string; description: string; mpCost: number; imageUrl?: string }> {
  return [
    {
      id: 'skill_appraise',
      name: 'Appraise & Scan',
      description: 'Analyzes enemy stats and weaknesses.',
      mpCost: 5,
      imageUrl: getSkillImageUrl('Appraise & Scan', 'utility'),
    },
  ];
}

export function generateStarterCompanion(): Companion {
  return {
    id: 'companion_sylph',
    name: 'Aria (Magic Guardian)',
    role: 'Elven Guide',
    loyalty: 80,
    affection: 65,
    romanceStatus: 'Close Confidante',
    status: 'Accompanying your reincarnation journey with growing devotion',
    avatarUrl: getCompanionAvatarUrl('Aria (Magic Guardian)', 'Elven Guide'),
    favoriteGift: 'Moonlight Lotus',
    personality: 'Gentle, fiercely loyal, deeply observant',
  };
}

export function generatePrologueMemory(
  turnNumber: number,
  characterName: string,
  cheatSkill: CheatSkill,
): StoryMemory {
  return {
    id: 'mem_prologue',
    turnNumber,
    title: 'Arrival in Aetheria',
    description: `Awakened in the Runic Sanctum, met the Elven Guide Aria, and discovered your unique Cheat Skill: ${cheatSkill.name}.`,
    category: 'secret',
  };
}

export function getFallbackPrologue(payload: StartGamePayload): GameTurnResult {
  const name = payload.characterName || 'Reincarnator';

  return {
    narrative: `Blinding magical circles slice through the dark void. When you open your eyes, you are no longer on Earth. You stand inside an ancient runic sanctum pulsing with raw ethereal mana.
A glowing crystal orb illuminates your status: "${name}, Level 1". From inside your soul radiates your unique cheat skill signet. In the distance, grand castle spires break the horizon while monster roars echo from the shadowed woods.`,
    location: 'Runic Sanctum',
    audioMood: 'mystic',
    statChanges: {
      hp: 120,
      maxHp: 120,
      mp: 80,
      maxMp: 80,
      exp: 0,
      maxExp: 100,
      level: 1,
      karma: 10,
      fatePoints: 3,
    },
    worldChanges: {
      worldName: 'Realm of Aetheria',
      threatLevel: 25,
      worldChaosLevel: 15,
      worldEventSummary: 'The Demon Army advances north. The Kingdom is searching for a Hero.',
    },
    newItems: [
      {
        action: 'add',
        item: {
          id: 'item_starter_blade',
          name: 'Sanctum Sword',
          description: 'A blade forged in mana-infused steel.',
          type: 'weapon',
          count: 1,
        },
      },
      {
        action: 'add',
        item: {
          id: 'item_hp_potion',
          name: 'Health Elixir (x2)',
          description: 'Restores 50 HP.',
          type: 'potion',
          count: 2,
        },
      },
    ],
    newSkills: [
      {
        id: 'skill_appraise',
        name: 'Appraise & Scan',
        description: 'Analyzes enemy stats and weaknesses.',
        mpCost: 5,
        imageUrl: getSkillImageUrl('Appraise & Scan', 'utility'),
      },
    ],
    partyChanges: [
      {
        id: 'companion_sylph',
        name: 'Aria (Magic Guardian)',
        role: 'Elven Guide',
        loyalty: 80,
        affection: 65,
        romanceStatus: 'Close Confidante',
        status: 'Accompanying your reincarnation journey with growing devotion',
        avatarUrl: getCompanionAvatarUrl('Aria (Magic Guardian)', 'Elven Guide'),
        favoriteGift: 'Moonlight Lotus',
        personality: 'Gentle, fiercely loyal, deeply observant',
      },
    ],
    newMemories: [
      {
        id: 'mem_prologue',
        turnNumber: 1,
        title: 'Arrival in Aetheria',
        description: `Awakened in the Runic Sanctum, met the Elven Guide Aria, and discovered your unique Cheat Skill.`,
        category: 'secret',
      },
    ],
    choices: [
      {
        id: 'choice_explore_forest',
        text: 'Explore the nearby magical forest for beasts.',
        type: 'combat',
        risk: 'moderate',
      },
      {
        id: 'choice_head_to_capital',
        text: 'Head directly to the Royal Capital Adventurers Guild.',
        type: 'diplomacy',
        risk: 'safe',
      },
      {
        id: 'choice_test_cheat',
        text: 'Unleash your Cheat Skill on the sanctum seal.',
        type: 'cheat',
        risk: 'safe',
      },
      {
        id: 'choice_fate_meditate',
        text: 'Meditate on ancient runes using Fate Points.',
        type: 'fate',
        risk: 'safe',
      },
    ],
    isGameOver: false,
    imagePrompt: 'Ancient anime fantasy sanctum glowing purple mana runes with sword and status screen',
  };
}

export interface FallbackTurnContext {
  choiceId?: string;
  choiceText?: string;
  customActionText?: string;
  stats: CharacterStats;
  world: WorldState;
  companions: Companion[];
  turnCount: number;
}

export function getFallbackTurn(context: FallbackTurnContext): GameTurnResult {
  const currentHp = context.stats.hp;
  const currentLevel = context.stats.level;
  const turn = context.turnCount + 1;

  const expGained = 50;
  const levelUp = applyExperience(context.stats.exp, currentLevel, context.stats.maxExp, expGained);

  const updatedCompanions: Companion[] = context.companions.map((comp) => {
    const cLevel = comp.level || 1;
    const cExp = (comp.exp || 0) + 30;
    const cMaxExp = comp.maxExp || 100;
    const cLevelUp = applyExperience(cExp, cLevel, cMaxExp, 30);

    if (cLevelUp.newLevel > cLevel) {
      return {
        ...comp,
        level: cLevelUp.newLevel,
        exp: cLevelUp.newExp,
        maxExp: cLevelUp.newMaxExp,
        str: (comp.str || 10) + 2,
        mag: (comp.mag || 10) + 2,
        loyalty: Math.min(100, (comp.loyalty || 50) + 5),
        status: `Leveled up to Lvl ${cLevelUp.newLevel}! Battle ready.`,
      };
    }
    return {
      ...comp,
      level: cLevelUp.newLevel,
      exp: cLevelUp.newExp,
      maxExp: cLevelUp.newMaxExp,
      str: comp.str || 10,
      mag: comp.mag || 10,
    };
  });

  const actionText = context.customActionText || context.choiceText || 'Selected option choice';
  const choiceId = (context.choiceId || '').toLowerCase();
  const lowerText = actionText.toLowerCase();

  let narrative = '';
  let location = context.world.worldName;
  let audioMood: 'fantasy' | 'battle' | 'mystic' | 'dark' | 'triumph' | 'tranquil' = 'fantasy';

  if (choiceId.includes('cheat') || lowerText.includes('cheat') || lowerText.includes('unleash') || lowerText.includes('miracle')) {
    audioMood = 'triumph';
    narrative = `You take decisive action: "${actionText}".
Activating your legendary cheat skill, overwhelming prismatic waves of raw mana erupt from your hands! The obstacles before you instantly vaporize, leaving onlookers in speechless awe. You gain immense renown!`;
  } else if (choiceId.includes('combat') || lowerText.includes('combat') || lowerText.includes('attack') || lowerText.includes('fight') || lowerText.includes('assault') || lowerText.includes('beast') || lowerText.includes('explore')) {
    audioMood = 'battle';
    narrative = `You take decisive action: "${actionText}".
Weapon drawn, you charge forward into battle. Executing swift tactical maneuvers, you strike down the demonic beasts threatening the border. You collect valuable Mana Crystals and EXP!`;
  } else if (choiceId.includes('diplomacy') || lowerText.includes('capital') || lowerText.includes('guild') || lowerText.includes('noble') || lowerText.includes('alliance') || lowerText.includes('head')) {
    audioMood = 'tranquil';
    narrative = `You take decisive action: "${actionText}".
Arriving at the bustling Royal Guild, you engage with high-ranking officers and veteran adventurers. Your strategic charm earns you respect, valuable intelligence on the Demon King, and official backing!`;
  } else if (choiceId.includes('fate') || lowerText.includes('meditate') || lowerText.includes('ruin') || lowerText.includes('artifact') || lowerText.includes('delve') || lowerText.includes('investigate')) {
    audioMood = 'mystic';
    narrative = `You take decisive action: "${actionText}".
Deep within ancient subterranean ruins, you uncover glowing runic circles etched by primordial sorcerers. Deciphering the symbols unlocks dormant mana reserves within your soul!`;
  } else {
    audioMood = 'fantasy';
    narrative = `You take decisive action: "${actionText}".
Your action causes a ripple effect throughout ${location}. Local factions take notice of your growing influence as new paths open before you!`;
  }

  return {
    narrative,
    location,
    audioMood,
    statChanges: {
      exp: levelUp.newExp,
      maxExp: levelUp.newMaxExp,
      level: levelUp.newLevel,
      statPoints: (context.stats.statPoints || 0) + levelUp.statPointsGained,
      skillPoints: (context.stats.skillPoints || 0) + levelUp.skillPointsGained,
      hp: Math.min(context.stats.maxHp, currentHp + 15),
      karma: context.stats.karma + 5,
    },
    partyChanges: updatedCompanions,
    newMemories: [
      {
        id: `mem_turn_${turn}`,
        turnNumber: turn,
        title: `Resolved Action: ${actionText.slice(0, 30)}...`,
        description: `In ${location}, you executed "${actionText}", earning EXP and making your mark on the realm.`,
        category: lowerText.includes('cheat')
          ? 'secret'
          : lowerText.includes('combat')
            ? 'battle'
            : 'vow',
      },
    ],
    worldChanges: {
      threatLevel: Math.min(100, context.world.threatLevel + 2),
      worldChaosLevel: context.world.worldChaosLevel,
    },
    choices: [
      {
        id: `turn_${turn}_combat`,
        text: `Launch an assault on the Demon Vanguard advancing on ${location}.`,
        type: 'combat',
        risk: 'high',
      },
      {
        id: `turn_${turn}_diplomacy`,
        text: `Negotiate a joint alliance with the Royal Sorcerers Guild.`,
        type: 'diplomacy',
        risk: 'safe',
      },
      {
        id: `turn_${turn}_cheat`,
        text: `Unleash your divine power to alter the battleground.`,
        type: 'cheat',
        risk: 'safe',
      },
      {
        id: `turn_${turn}_fate`,
        text: `Investigate high-rank magical anomalies radiating nearby.`,
        type: 'fate',
        risk: 'moderate',
      },
    ],
    isGameOver: false,
    imagePrompt: `Anime fantasy scene in ${location} with magic effects and status HUD`,
  };
}
