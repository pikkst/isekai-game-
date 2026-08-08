import React, { useState, useEffect } from 'react';
import {
  Language,
  StartGamePayload,
  CharacterStats,
  WorldState,
  InventoryItem,
  Skill,
  Companion,
  Equipment,
  GameTurnChoice,
  CombatInfo,
  TimelineNode,
  HallOfFameRecord,
  CheatSkill,
  StoryMemory,
  CHEAT_SKILLS_PRESETS,
} from '@isekai/contracts';
import { INITIAL_SKILL_TREE } from './data/skillTree';
import { Header } from './components/Header';
import { CharacterCreation } from './components/CharacterCreation';
import { StatusCard } from './components/StatusCard';
import { StoryViewer } from './components/StoryViewer';
import { ChoicesPanel } from './components/ChoicesPanel';
import { TabsDrawer } from './components/TabsDrawer';
import { GameOverModal } from './components/GameOverModal';
import { HallOfFameModal } from './components/HallOfFameModal';
import { soundEngine } from './utils/soundEngine';

export default function App() {
  const [gameState, setGameState] = useState<'creation' | 'playing'>('creation');
  const [language, setLanguage] = useState<Language>('et');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [stats, setStats] = useState<CharacterStats>({
    name: 'Arthur',
    title: 'Newborn Reincarnator',
    level: 1,
    exp: 0,
    maxExp: 100,
    hp: 120,
    maxHp: 120,
    mp: 80,
    maxMp: 80,
    str: 10,
    mag: 10,
    agi: 10,
    luk: 10,
    karma: 0,
    fatePoints: 3,
  });

  const [cheatSkill, setCheatSkill] = useState<CheatSkill>(CHEAT_SKILLS_PRESETS[0]);
  const [world, setWorld] = useState<WorldState>({
    worldName: 'Aetheria',
    threatLevel: 10,
    worldChaosLevel: 5,
    factionStandings: { 'Royal Capital': 50 },
    worldEventSummary: 'The world rests in peace, but whispers of the Demon King echo.',
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillTreeNodes, setSkillTreeNodes] = useState<Skill[]>(INITIAL_SKILL_TREE);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [memoryLogs, setMemoryLogs] = useState<StoryMemory[]>([]);
  const [equipment, setEquipment] = useState<Equipment>({});
  const [turnCount, setTurnCount] = useState<number>(0);

  const [lastLocation, setLastLocation] = useState<string>('Unknown Sanctum');
  const [lastNarrative, setLastNarrative] = useState<string>('');
  const [lastImagePrompt, setLastImagePrompt] = useState<string>('');
  const [lastSceneImageUrl, setLastSceneImageUrl] = useState<string>('');
  const [choices, setChoices] = useState<GameTurnChoice[]>([]);
  const [combatInfo, setCombatInfo] = useState<CombatInfo | null>(null);
  const [timeline, setTimeline] = useState<TimelineNode[]>([]);

  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameEndType, setGameEndType] = useState<'victory' | 'defeat' | 'ascension' | 'peaceful' | null>(null);
  const [isHallOfFameOpen, setIsHallOfFameOpen] = useState<boolean>(false);
  const [hallOfFameRecords, setHallOfFameRecords] = useState<HallOfFameRecord[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('isekai_hall_of_fame');
      if (saved) {
        setHallOfFameRecords(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse saved Hall of Fame', e);
    }
  }, []);

  const saveToHallOfFame = (record: HallOfFameRecord) => {
    const updated = [record, ...hallOfFameRecords];
    setHallOfFameRecords(updated);
    try {
      localStorage.setItem('isekai_hall_of_fame', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  };

  const handleClearRecords = () => {
    setHallOfFameRecords([]);
    localStorage.removeItem('isekai_hall_of_fame');
  };

  const handleStartGame = async (payload: StartGamePayload) => {
    setIsLoading(true);

    const foundCheat = CHEAT_SKILLS_PRESETS.find((c) => c.id === payload.cheatSkillId) || {
      id: 'custom_cheat',
      name: payload.customCheatPrompt || 'Custom Divine Cheat',
      description: payload.customCheatPrompt || 'Unfathomable cheat powers.',
      cooldown: 0,
      type: 'divine' as const,
    };
    setCheatSkill(foundCheat);

    const initialCharacterStats: CharacterStats = {
      name: payload.characterName,
      title: language === 'et' ? 'Reinkarneerunu' : 'Reincarnated One',
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
    setStats(initialCharacterStats);

    try {
       const res = await fetch('/api/isekai/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      if (!res.ok) throw new Error('API request failed');

       const data = await res.json();

       setSessionId(data.sessionId);

       const turnResult = data.turnResult || data;

       setLastNarrative(turnResult.narrative);
       setLastLocation(turnResult.location || 'Runic Sanctum');
       setLastImagePrompt(turnResult.imagePrompt || '');
       setLastSceneImageUrl(turnResult.sceneImageUrl || '');
       setChoices(turnResult.choices || []);
       setCombatInfo(turnResult.combatInfo || null);
       setTurnCount(1);

       if (turnResult.statChanges) {
         setStats((prev) => ({ ...prev, ...turnResult.statChanges }));
       }
       if (turnResult.worldChanges) {
         setWorld((prev) => ({ ...prev, ...turnResult.worldChanges }));
       }
       if (turnResult.newItems) {
         setInventory(turnResult.newItems.map((ni: { item: InventoryItem }) => ni.item));
       }
       if (turnResult.newSkills) {
         setSkills(turnResult.newSkills);
       }
       if (turnResult.partyChanges) {
         setCompanions(turnResult.partyChanges);
       }
       if (turnResult.newMemories) {
         setMemoryLogs(turnResult.newMemories);
       } else {
         setMemoryLogs([
           {
             id: 'mem_1',
             turnNumber: 1,
             title: 'Reincarnation Awakening',
             description: `Reborn as ${payload.characterName} with ${foundCheat.name}.`,
             category: 'secret',
           },
         ]);
       }

       setTimeline([
         {
           turnNumber: 1,
           location: turnResult.location || 'Runic Sanctum',
           narrativeSnippet: turnResult.narrative.slice(0, 100) + '...',
           choiceMade: language === 'et' ? 'Reinkarnatsiooni algus' : 'Reincarnation Begin',
           karmaAtTurn: 0,
           statsAtTurn: { level: 1, hp: initialCharacterStats.hp, mp: initialCharacterStats.mp },
         },
       ]);

       setGameState('playing');
       soundEngine.startAmbientAtmosphere(turnResult.audioMood || 'mystic');
    } catch (err) {
      console.error('Failed to start game:', err);
    } finally {
      setIsLoading(false);
    }
  };

   const handleTurnAction = async (choiceId?: string, customText?: string) => {
    if (isLoading || !sessionId) return;
    setIsLoading(true);

    const currentTurn = turnCount + 1;
    setTurnCount(currentTurn);

    const selectedChoiceObj = choices.find((c) => c.id === choiceId);
    const choiceText = selectedChoiceObj ? selectedChoiceObj.text : undefined;

    let action;
    if (choiceId && !customText) {
      action = { type: 'choice' as const, choiceId };
    } else if (customText) {
      action = { type: 'custom' as const, text: customText };
    } else {
      action = { type: 'reroll' as const };
    }

    const payload = {
      sessionId,
      idempotencyKey: crypto.randomUUID(),
      action,
    };

    try {
      const res = await fetch('/api/isekai/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();

      const turnResult = data.turnResult || data;

      setLastNarrative(turnResult.narrative);
      if (turnResult.location) setLastLocation(turnResult.location);
      if (turnResult.imagePrompt) setLastImagePrompt(turnResult.imagePrompt);
      if (turnResult.sceneImageUrl) setLastSceneImageUrl(turnResult.sceneImageUrl);
      if (turnResult.choices) setChoices(turnResult.choices);
      setCombatInfo(turnResult.combatInfo || null);

      if (turnResult.statChanges) {
        setStats((prev) => {
          const updated = { ...prev, ...turnResult.statChanges };
          if (updated.exp >= updated.maxExp) {
            soundEngine.playLevelUp();
          }
          return updated;
        });
      }

      if (turnResult.worldChanges) {
        setWorld((prev) => ({ ...prev, ...turnResult.worldChanges }));
      }

      if (turnResult.newItems) {
        setInventory((prev) => {
          let updated = [...prev];
          turnResult.newItems.forEach((change: { action: string; item: InventoryItem }) => {
            if (change.action === 'add') {
              const existingIdx = updated.findIndex((i) => i.id === change.item.id);
              if (existingIdx >= 0) {
                updated[existingIdx].count += change.item.count;
              } else {
                updated.push(change.item);
              }
            } else if (change.action === 'remove') {
              updated = updated.filter((i) => i.id !== change.item.id);
            }
          });
          return updated;
        });
      }

      if (turnResult.newSkills) {
        setSkills((prev) => [...prev, ...turnResult.newSkills]);
      }

      if (turnResult.partyChanges) {
        setCompanions(turnResult.partyChanges);
      }

      if (turnResult.newMemories && turnResult.newMemories.length > 0) {
        setMemoryLogs((prev) => [...turnResult.newMemories, ...prev]);
      }

      const selectedLabel = selectedChoiceObj ? selectedChoiceObj.text : customText || 'Custom Action';

      setTimeline((prev) => [
        ...prev,
        {
          turnNumber: currentTurn,
          location: data.location || lastLocation,
          narrativeSnippet: data.narrative.slice(0, 100) + '...',
          choiceMade: selectedLabel,
          karmaAtTurn: stats.karma,
          statsAtTurn: { level: stats.level, hp: stats.hp, mp: stats.mp },
        },
      ]);

      if (data.isGameOver) {
        setIsGameOver(true);
        setGameEndType(data.gameEndType || 'victory');

        const newRecord: HallOfFameRecord = {
          id: 'rec_' + Date.now(),
          characterName: stats.name,
          title: stats.title,
          worldName: world.worldName,
          archetype: 'Isekai RPG',
          endingType: data.gameEndType || 'Victory',
          turnsSurvived: currentTurn,
          finalLevel: stats.level,
          summary: data.narrative.slice(0, 120) + '...',
          timestamp: new Date().toLocaleDateString(),
        };
        saveToHallOfFame(newRecord);
      }
    } catch (err) {
      console.error('Failed to process turn:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseItem = (itemId: string) => {
    setInventory((prev) => {
      const idx = prev.findIndex((i) => i.id === itemId);
      if (idx < 0) return prev;

      const item = prev[idx];
      if (item.count > 1) {
        const copy = [...prev];
        copy[idx] = { ...item, count: item.count - 1 };
        return copy;
      }
      return prev.filter((i) => i.id !== itemId);
    });

    setStats((prev) => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + 50),
      mp: Math.min(prev.maxMp, prev.mp + 30),
    }));
  };

  const handleSpendFatePoint = () => {
    if (stats.fatePoints <= 0) return;
    setStats((prev) => ({ ...prev, fatePoints: prev.fatePoints - 1 }));
    handleTurnAction(
      undefined,
      language === 'et'
        ? 'Kasutan Saatusepunkti et luua jumalik imetegu ja muuta sündmuste käiku!'
        : 'I spend a Fate Point to invoke a divine miracle and rewrite fate!',
    );
  };

  const handleAllocateStat = (stat: 'str' | 'mag' | 'agi' | 'luk') => {
    if (!stats.statPoints || stats.statPoints <= 0) return;
    setStats((prev) => {
      const remainingPts = (prev.statPoints || 0) - 1;
      const newVal = (prev[stat] || 10) + 1;
      let maxHp = prev.maxHp;
      let maxMp = prev.maxMp;
      let hp = prev.hp;
      let mp = prev.mp;

      if (stat === 'str') {
        maxHp += 5;
        hp += 5;
      } else if (stat === 'mag') {
        maxMp += 5;
        mp += 5;
      }

      return {
        ...prev,
        [stat]: newVal,
        statPoints: remainingPts,
        maxHp,
        maxMp,
        hp,
        mp,
      };
    });
  };

  const handleUnlockSkill = (skillId: string) => {
    const node = skillTreeNodes.find((n) => n.id === skillId);
    if (!node) return;
    const currentPts = stats.skillPoints || 0;
    const cost = node.costPoints || 1;
    if (currentPts < cost) return;

    setStats((prev) => {
      const newPts = (prev.skillPoints || 0) - cost;
      const strBonus = node.statBonus?.str || 0;
      const magBonus = node.statBonus?.mag || 0;
      const agiBonus = node.statBonus?.agi || 0;
      const lukBonus = node.statBonus?.luk || 0;

      return {
        ...prev,
        skillPoints: newPts,
        str: prev.str + strBonus,
        mag: prev.mag + magBonus,
        agi: prev.agi + agiBonus,
        luk: prev.luk + lukBonus,
        maxHp: prev.maxHp + strBonus * 5,
        maxMp: prev.maxMp + magBonus * 5,
        hp: prev.hp + strBonus * 5,
        mp: prev.mp + magBonus * 5,
      };
    });

    setSkills((prev) => {
      if (prev.some((s) => s.id === skillId)) return prev;
      return [...prev, { ...node, unlocked: true }];
    });

    setSkillTreeNodes((prev) =>
      prev.map((n) => (n.id === skillId ? { ...n, unlocked: true } : n)),
    );
  };

  const handleTrainCompanion = (companionId: string) => {
    setCompanions((prev) =>
      prev.map((comp) => {
        if (comp.id === companionId) {
          const cLvl = (comp.level || 1) + 1;
          return {
            ...comp,
            level: cLvl,
            exp: 0,
            maxExp: Math.floor((comp.maxExp || 100) * 1.4),
            str: (comp.str || 12) + 3,
            mag: (comp.mag || 12) + 3,
            loyalty: Math.min(100, (comp.loyalty || 50) + 10),
            status: `Trained intensively with ${stats.name}! Reached Level ${cLvl}.`,
          };
        }
        return comp;
      }),
    );
  };

  const handleGiftCompanion = (companionId: string) => {
    setCompanions((prev) =>
      prev.map((c) => {
        if (c.id === companionId) {
          const newAffection = Math.min(100, (c.affection || 50) + 15);
          let status = c.romanceStatus || 'Ally';
          if (newAffection >= 90) status = 'Harem Empress';
          else if (newAffection >= 75) status = 'Sworn Soulmate';
          else if (newAffection >= 60) status = 'Beloved';
          else if (newAffection >= 40) status = 'Close Confidante';

          return {
            ...c,
            affection: newAffection,
            romanceStatus: status as Companion['romanceStatus'],
            status: `Received a precious gift from ${stats.name}! Affection increased to ${newAffection}%.`,
          };
        }
        return c;
      }),
    );

    setMemoryLogs((prev) => [
      {
        id: 'mem_gift_' + Date.now(),
        turnNumber: turnCount,
        title: 'Thoughtful Gift Offered',
        description: `Offered a treasured token of affection to a companion, deepening your harem bond.`,
        category: 'romance',
      },
      ...prev,
    ]);
  };

  const handleRomanceCompanion = (companionId: string) => {
    const comp = companions.find((c) => c.id === companionId);
    if (!comp) return;

    setCompanions((prev) =>
      prev.map((c) => {
        if (c.id === companionId) {
          const newAffection = Math.min(100, (c.affection || 50) + 25);
          let status = 'Beloved';
          if (newAffection >= 90) status = 'Harem Empress';
          else if (newAffection >= 75) status = 'Sworn Soulmate';

          return {
            ...c,
            affection: newAffection,
            romanceStatus: status as Companion['romanceStatus'],
            status: `Shared an intimate date & heartfelt confession with ${stats.name}! Bond ascended to ${status}.`,
          };
        }
        return c;
      }),
    );

    handleTurnAction(
      undefined,
      language === 'et'
        ? `Veedan romantilise hetke oma kaaslasega ${comp.name}, tugevdades meie tundeid ja hingesidet.`
        : `I spend an intimate romantic date with my beloved companion ${comp.name}, deepening our soulmate bond.`,
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onOpenHallOfFame={() => setIsHallOfFameOpen(true)}
        onRestartGame={() => {
          setIsGameOver(false);
          setGameState('creation');
        }}
        isPlaying={gameState === 'playing'}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {gameState === 'creation' ? (
          <CharacterCreation
            language={language}
            onStartGame={handleStartGame}
            isLoading={isLoading}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="space-y-6 lg:col-span-1">
              <StatusCard
                stats={stats}
                cheatSkill={cheatSkill}
                language={language}
                onUseCheatSkill={() =>
                  handleTurnAction(
                    undefined,
                    language === 'et'
                      ? `Aktiveerin oma võimsa Cheat-oskuse: ${cheatSkill.name}!`
                      : `Unleashing my Cheat Skill: ${cheatSkill.name}!`,
                  )
                }
                onSpendFatePoint={handleSpendFatePoint}
                onAllocateStat={handleAllocateStat}
                isLoading={isLoading}
              />

              <TabsDrawer
                stats={stats}
                equipment={equipment}
                inventory={inventory}
                companions={companions}
                skills={skills}
                skillTreeNodes={skillTreeNodes}
                world={world}
                timeline={timeline}
                memoryLogs={memoryLogs}
                onUseItem={handleUseItem}
                onUnlockSkill={handleUnlockSkill}
                onTrainCompanion={handleTrainCompanion}
                onGiftCompanion={handleGiftCompanion}
                onRomanceCompanion={handleRomanceCompanion}
              />
            </div>

            <div className="space-y-6 lg:col-span-2">
              <StoryViewer
                narrative={lastNarrative}
                location={lastLocation}
                combatInfo={combatInfo}
                companions={companions}
                language={language}
                imagePrompt={lastImagePrompt}
                sceneImageUrl={lastSceneImageUrl}
                isLoading={isLoading}
              />

              <ChoicesPanel
                choices={choices}
                language={language}
                onSelectChoice={(choiceId) => handleTurnAction(choiceId)}
                onSubmitCustomAction={(customText) => handleTurnAction(undefined, customText)}
                onRerollChoices={handleSpendFatePoint}
                fatePoints={stats.fatePoints}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </main>

      {isGameOver && (
        <GameOverModal
          gameEndType={gameEndType}
          stats={stats}
          world={world}
          turnCount={turnCount}
          language={language}
          onRestart={() => {
            setIsGameOver(false);
            setGameState('creation');
          }}
          onOpenHallOfFame={() => {
            setIsGameOver(false);
            setIsHallOfFameOpen(true);
          }}
        />
      )}

      {isHallOfFameOpen && (
        <HallOfFameModal
          records={hallOfFameRecords}
          language={language}
          onClose={() => setIsHallOfFameOpen(false)}
          onClearRecords={handleClearRecords}
        />
      )}
    </div>
  );
}
