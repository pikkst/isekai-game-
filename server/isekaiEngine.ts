import { GoogleGenAI, Type } from '@google/genai';
import {
  StartGamePayload,
  TurnActionPayload,
  GameTurnResult,
  CharacterStats,
  WorldState,
  InventoryItem,
  Skill,
  Companion,
  GameTurnChoice,
} from '../src/types.js';
import {
  getSceneImageUrl,
  getSkillImageUrl,
  getCompanionAvatarUrl,
} from '../src/utils/imageGenerator.js';

// Initialize Gemini client server-side
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to enrich result with consistent image URLs
function enrichTurnResultWithImages(result: GameTurnResult): GameTurnResult {
  const sceneUrl = getSceneImageUrl(result.location || 'Sanctum', result.imagePrompt || result.narrative);

  const enrichedSkills = result.newSkills?.map((skill) => ({
    ...skill,
    imageUrl: skill.imageUrl || getSkillImageUrl(skill.name, skill.isCheat ? 'cheat' : 'magic'),
  }));

  const enrichedCompanions = result.partyChanges?.map((comp) => ({
    ...comp,
    avatarUrl: comp.avatarUrl || getCompanionAvatarUrl(comp.name, comp.role),
  }));

  return {
    ...result,
    sceneImageUrl: sceneUrl,
    newSkills: enrichedSkills,
    partyChanges: enrichedCompanions,
  };
}

// Response schema for structured Gemini story turns
const gameTurnResponseSchema = {
  type: Type.OBJECT,
  properties: {
    narrative: {
      type: Type.STRING,
      description: 'The story continuation in rich descriptive style in English.',
    },
    location: {
      type: Type.STRING,
      description: 'Current location or scene name in English.',
    },
    audioMood: {
      type: Type.STRING,
      description: 'Atmospheric audio mood: fantasy, battle, mystic, dark, triumph, or tranquil.',
    },
    statChanges: {
      type: Type.OBJECT,
      description: 'Updates to stats if any (e.g. hp change, exp gained, karma change).',
      properties: {
        hp: { type: Type.INTEGER },
        maxHp: { type: Type.INTEGER },
        mp: { type: Type.INTEGER },
        maxMp: { type: Type.INTEGER },
        str: { type: Type.INTEGER },
        mag: { type: Type.INTEGER },
        agi: { type: Type.INTEGER },
        luk: { type: Type.INTEGER },
        level: { type: Type.INTEGER },
        exp: { type: Type.INTEGER },
        maxExp: { type: Type.INTEGER },
        karma: { type: Type.INTEGER },
        fatePoints: { type: Type.INTEGER },
      },
    },
    worldChanges: {
      type: Type.OBJECT,
      description: 'World status changes.',
      properties: {
        worldName: { type: Type.STRING },
        threatLevel: { type: Type.INTEGER },
        worldChaosLevel: { type: Type.INTEGER },
        worldEventSummary: { type: Type.STRING },
      },
    },
    newItems: {
      type: Type.ARRAY,
      description: 'Items acquired or removed.',
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, description: "add or remove" },
          item: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING },
              effect: { type: Type.STRING },
              count: { type: Type.INTEGER },
            },
            required: ['id', 'name', 'description', 'type', 'count'],
          },
        },
        required: ['action', 'item'],
      },
    },
    newSkills: {
      type: Type.ARRAY,
      description: 'New skills unlocked.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          mpCost: { type: Type.INTEGER },
          isCheat: { type: Type.BOOLEAN },
        },
        required: ['id', 'name', 'description', 'mpCost'],
      },
    },
    partyChanges: {
      type: Type.ARRAY,
      description: 'Updated companions or new allies joined.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          loyalty: { type: Type.INTEGER },
          status: { type: Type.STRING },
        },
        required: ['id', 'name', 'role', 'loyalty', 'status'],
      },
    },
    choices: {
      type: Type.ARRAY,
      description: '4 exciting choice options for the player.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          type: { type: Type.STRING, description: 'combat, diplomacy, stealth, cheat, fate, or exploration' },
          risk: { type: Type.STRING, description: 'safe, moderate, high, or extreme' },
        },
        required: ['id', 'text', 'type', 'risk'],
      },
    },
    isGameOver: { type: Type.BOOLEAN },
    gameEndType: { type: Type.STRING, description: 'victory, defeat, ascension, peaceful or null' },
    combatInfo: {
      type: Type.OBJECT,
      properties: {
        enemyName: { type: Type.STRING },
        enemyHp: { type: Type.INTEGER },
        enemyMaxHp: { type: Type.INTEGER },
        battleLog: { type: Type.STRING },
      },
    },
    imagePrompt: { type: Type.STRING, description: 'Visual description of scene for artwork generator.' },
  },
  required: ['narrative', 'location', 'choices', 'isGameOver'],
};

export async function processStartGame(payload: StartGamePayload): Promise<GameTurnResult> {
  const ai = getGeminiClient();

  if (!ai) {
    return enrichTurnResultWithImages(getFallbackPrologue(payload));
  }

  const prompt = `You are a master Isekai RPG Game Master running an immersive, interactive Isekai story game.
Language: ALWAYS respond 100% in English.
Character Name: ${payload.characterName}
World Archetype: ${payload.worldArchetype}
Custom World Description: ${payload.customWorldPrompt || 'None'}
Reincarnation Method: ${payload.reincarnationMethod}
Cheat Skill Selected: ${payload.cheatSkillId} (${payload.customCheatPrompt || 'Standard Cheat'})
Initial Stats: STR:${payload.initialStats.str}, MAG:${payload.initialStats.mag}, AGI:${payload.initialStats.agi}, LUK:${payload.initialStats.luk}

Instructions:
1. Write an epic, captivating prologue introducing the rebirth/summoning scene.
2. Establish the location, the discovery of the player's stats/cheat skill, and the immediate world situation.
3. Provide 4 distinct choice options for the player (1 combat/action, 1 clever/diplomatic, 1 using cheat skill, 1 fate/exploratory).
4. Return valid structured JSON conforming strictly to the response schema in 100% English.
`;

  const candidateModels = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: gameTurnResponseSchema,
          temperature: 0.8,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as GameTurnResult;
        return enrichTurnResultWithImages(parsed);
      }
    } catch (err: any) {
      console.warn(`Gemini API start game error on model ${modelName}:`, err?.message || err);
    }
  }

  return enrichTurnResultWithImages(getFallbackPrologue(payload));
}

export async function processTurnAction(payload: TurnActionPayload): Promise<GameTurnResult> {
  const ai = getGeminiClient();

  const selectedActionText = payload.customActionText || payload.choiceText || 'Selected option choice';

  if (!ai) {
    return enrichTurnResultWithImages(getFallbackTurn(payload));
  }

  const memoriesContext = payload.gameState.memoryLogs
    ? payload.gameState.memoryLogs.map((m) => `[Turn ${m.turnNumber}] ${m.title}: ${m.description}`).join(' | ')
    : 'No key story memories logged yet.';

  const companionsContext = payload.gameState.companions.length > 0
    ? payload.gameState.companions.map((c) => `${c.name} (Role: ${c.role}, Loyalty: ${c.loyalty}%, Affection/Romance: ${c.affection || 50}%, Status: ${c.romanceStatus || 'Ally'})`).join('; ')
    : 'No companions in party currently.';

  const prompt = `You are an expert Isekai RPG Story Master running an immersive fantasy/sci-fi visual novel RPG.
Language: ALWAYS respond 100% in English.

CURRENT GAME STATE:
Character: ${payload.gameState.stats.name} (Title: ${payload.gameState.stats.title}, Level: ${payload.gameState.stats.level}, HP: ${payload.gameState.stats.hp}/${payload.gameState.stats.maxHp}, MP: ${payload.gameState.stats.mp}/${payload.gameState.stats.maxMp}, Karma: ${payload.gameState.stats.karma}, Fate Points: ${payload.gameState.stats.fatePoints})
Stats: STR:${payload.gameState.stats.str}, MAG:${payload.gameState.stats.mag}, AGI:${payload.gameState.stats.agi}, LUK:${payload.gameState.stats.luk}
Cheat Skill: ${payload.gameState.cheatSkill.name} - ${payload.gameState.cheatSkill.description}
Current Location: ${payload.gameState.lastLocation}
World State: World Name "${payload.gameState.world.worldName}", Threat Level: ${payload.gameState.world.threatLevel}/100, Chaos: ${payload.gameState.world.worldChaosLevel}/100.
Party / Harem Companions: ${companionsContext}
Inventory: ${payload.gameState.inventory.map((i) => i.name).join(', ') || 'Empty'}
Turn Count: ${payload.gameState.turnCount}

STORY MEMORIES & HISTORIC ARC LOGS:
${memoriesContext}

PREVIOUS SCENE:
${payload.gameState.lastNarrative}

PLAYER ACTION TAKEN BY USER:
"${selectedActionText}"
(Choice ID: ${payload.choiceId || 'Custom Action'})

RULES & INSTRUCTIONS:
1. Continue the story organically specifically responding to and resolving the player's action "${selectedActionText}" in 100% English.
2. STORYTELLING & ROMANCE/HAREM DYNAMICS: Write vivid, captivating narrative prose with character dialogue, emotional depth, and realistic consequences. If companions are present, show their affectionate reactions, romantic dialogue, or battle assistance based on their romance status!
3. MEMORY CONTINUITY: Reference past key decisions or story memories listed above to make the narrative feel continuous and deeply personalized.
4. CHEAT SKILL / MIRACLE: If the player used a Cheat Skill or Miracle, describe an overwhelming or spectacular outcome, but advance the main questline or raise higher-tier threats.
5. GAME OVER / ASCENSION: If HP drops to 0, set isGameOver = true with gameEndType = 'defeat'. If Demon King is defeated, set isGameOver = true with gameEndType = 'victory' or 'ascension'.
6. Provide 4 exciting, contextually relevant new choices for the player (1 combat, 1 diplomatic/romantic, 1 cheat skill usage, 1 exploratory/risky fate).
7. Return JSON strictly formatted to response schema in 100% English.
`;

  const candidateModels = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: gameTurnResponseSchema,
          temperature: 0.8,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as GameTurnResult;
        return enrichTurnResultWithImages(parsed);
      }
    } catch (err: any) {
      console.warn(`Gemini API turn action error on model ${modelName}:`, err?.message || err);
    }
  }

  return enrichTurnResultWithImages(getFallbackTurn(payload));
}

// Fallback Prologue Generator
function getFallbackPrologue(payload: StartGamePayload): GameTurnResult {
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

// Fallback Turn Generator
function getFallbackTurn(payload: TurnActionPayload): GameTurnResult {
  const currentHp = payload.gameState.stats.hp;
  const currentLevel = payload.gameState.stats.level;
  const turn = payload.gameState.turnCount + 1;

  // Level up progression simulation
  const expGained = 50;
  let newExp = payload.gameState.stats.exp + expGained;
  let newLevel = currentLevel;
  let maxExp = payload.gameState.stats.maxExp;
  let statPointsAdded = 0;
  let skillPointsAdded = 0;

  if (newExp >= maxExp) {
    const levelsGained = Math.floor(newExp / maxExp) || 1;
    newLevel += levelsGained;
    newExp = newExp % maxExp;
    maxExp = Math.floor(maxExp * 1.5);
    statPointsAdded = levelsGained * 3;
    skillPointsAdded = levelsGained * 1;
  }

  // Party member EXP gain & Level up
  const updatedCompanions = payload.gameState.companions.map((comp) => {
    const cLevel = comp.level || 1;
    const cExp = (comp.exp || 0) + 30;
    const cMaxExp = comp.maxExp || 100;

    if (cExp >= cMaxExp) {
      return {
        ...comp,
        level: cLevel + 1,
        exp: cExp - cMaxExp,
        maxExp: Math.floor(cMaxExp * 1.4),
        str: (comp.str || 10) + 2,
        mag: (comp.mag || 10) + 2,
        loyalty: Math.min(100, (comp.loyalty || 50) + 5),
        status: `Leveled up to Lvl ${cLevel + 1}! Battle ready.`,
      };
    }
    return {
      ...comp,
      level: cLevel,
      exp: cExp,
      maxExp: cMaxExp,
      str: comp.str || 10,
      mag: comp.mag || 10,
    };
  });

  const actionText = payload.customActionText || payload.choiceText || 'Selected option choice';
  const choiceId = (payload.choiceId || '').toLowerCase();
  const lowerText = actionText.toLowerCase();

  let narrative = '';
  let location = payload.gameState.lastLocation;
  let audioMood: 'fantasy' | 'battle' | 'mystic' | 'dark' | 'triumph' | 'tranquil' = 'fantasy';

  if (choiceId.includes('cheat') || lowerText.includes('cheat') || lowerText.includes('unleash') || lowerText.includes('miracle')) {
    audioMood = 'triumph';
    narrative = `You take decisive action: "${actionText}".
Activating your legendary cheat skill "${payload.gameState.cheatSkill.name}", overwhelming prismatic waves of raw mana erupt from your hands! The obstacles before you instantly vaporize, leaving onlookers in speechless awe. You gain immense renown!`;
  } else if (choiceId.includes('combat') || lowerText.includes('combat') || lowerText.includes('attack') || lowerText.includes('fight') || lowerText.includes('assault') || lowerText.includes('beast') || lowerText.includes('explore')) {
    audioMood = 'battle';
    location = 'Royal Shadowwood & Wilds';
    narrative = `You take decisive action: "${actionText}".
Weapon drawn, you charge forward into battle. Executing swift tactical maneuvers, you strike down the demonic beasts threatening the border. You collect valuable Mana Crystals and EXP!`;
  } else if (choiceId.includes('diplomacy') || lowerText.includes('capital') || lowerText.includes('guild') || lowerText.includes('noble') || lowerText.includes('alliance') || lowerText.includes('head')) {
    audioMood = 'tranquil';
    location = 'Royal Capital Grand Guild';
    narrative = `You take decisive action: "${actionText}".
Arriving at the bustling Royal Guild, you engage with high-ranking officers and veteran adventurers. Your strategic charm earns you respect, valuable intelligence on the Demon King, and official backing!`;
  } else if (choiceId.includes('fate') || lowerText.includes('meditate') || lowerText.includes('ruin') || lowerText.includes('artifact') || lowerText.includes('delve') || lowerText.includes('investigate')) {
    audioMood = 'mystic';
    location = 'Subterranean Rune Vault';
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
      exp: newExp,
      maxExp,
      level: newLevel,
      statPoints: (payload.gameState.stats.statPoints || 0) + statPointsAdded,
      skillPoints: (payload.gameState.stats.skillPoints || 0) + skillPointsAdded,
      hp: Math.min(payload.gameState.stats.maxHp, currentHp + 15),
      karma: payload.gameState.stats.karma + 5,
    },
    partyChanges: updatedCompanions,
    newMemories: [
      {
        id: `mem_turn_${turn}`,
        turnNumber: turn,
        title: `Resolved Action: ${actionText.slice(0, 30)}...`,
        description: `In ${location}, you executed "${actionText}", earning EXP and making your mark on the realm.`,
        category: lowerText.includes('cheat') ? 'secret' : lowerText.includes('combat') ? 'battle' : 'vow',
      },
    ],
    worldChanges: {
      threatLevel: Math.min(100, payload.gameState.world.threatLevel + 2),
      worldChaosLevel: payload.gameState.world.worldChaosLevel,
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
        text: `Unleash ${payload.gameState.cheatSkill.name} to alter the battleground.`,
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
