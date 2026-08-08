import React, { useState } from 'react';
import {
  Sparkles,
  Sword,
  Cpu,
  Skull,
  Crown,
  ShieldAlert,
  Truck,
  Sun,
  Flame,
  Gamepad2,
  Zap,
  Dice5,
  Wand2,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import {
  Language,
  WorldArchetype,
  ReincarnationMethod,
  StartGamePayload,
} from '../types';
import {
  WORLD_PRESETS,
  REINCARNATION_PRESETS,
  CHEAT_SKILLS_PRESETS,
} from '../data/isekaiPresets';
import { soundEngine } from '../utils/soundEngine';
import { getCharacterAvatarUrl } from '../utils/imageGenerator';

interface CharacterCreationProps {
  language: Language;
  onStartGame: (payload: StartGamePayload) => void;
  isLoading: boolean;
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  language,
  onStartGame,
  isLoading,
}) => {
  // Form State
  const [characterName, setCharacterName] = useState('Arthur Vance');
  const [worldArchetype, setWorldArchetype] = useState<WorldArchetype>('high_fantasy');
  const [customWorldPrompt, setCustomWorldPrompt] = useState('');
  const [reincarnationMethod, setReincarnationMethod] = useState<ReincarnationMethod>('truck_kun');
  const [selectedCheatId, setSelectedCheatId] = useState<string>('cheat_appraisal_steal');
  const [customCheatPrompt, setCustomCheatPrompt] = useState('');

  // Stats Allocation State (10 bonus points)
  const [bonusPoints, setBonusPoints] = useState(10);
  const [stats, setStats] = useState({
    str: 10,
    mag: 10,
    agi: 10,
    luk: 10,
  });

  // Generated Avatar Preview
  const previewAvatarUrl = getCharacterAvatarUrl(characterName || 'Arthur Vance', worldArchetype);

  const handleStatChange = (statName: keyof typeof stats, delta: number) => {
    if (delta > 0 && bonusPoints <= 0) return;
    if (delta < 0 && stats[statName] <= 5) return;

    soundEngine.playClick();
    setStats((prev) => ({ ...prev, [statName]: prev[statName] + delta }));
    setBonusPoints((prev) => prev - delta);
  };

  const handleRandomize = () => {
    soundEngine.playClick();
    const namesEn = ['Kaelen Vance', 'Zephyr Blade', 'Aria Cross', 'Elden Ray', 'Nox Shadow'];
    const randomName = namesEn[Math.floor(Math.random() * namesEn.length)];
    setCharacterName(randomName);

    const archetypeList: WorldArchetype[] = [
      'high_fantasy',
      'cyberpunk_cultivation',
      'dark_demon_lord',
      'otome_academy',
      'post_apocalyptic',
    ];
    setWorldArchetype(archetypeList[Math.floor(Math.random() * archetypeList.length)]);

    const reincarnateList: ReincarnationMethod[] = [
      'truck_kun',
      'goddess_summon',
      'reborn_as_monster',
      'vrmmo_trapped',
      'god_mistake',
    ];
    setReincarnationMethod(reincarnateList[Math.floor(Math.random() * reincarnateList.length)]);

    const cheatList = CHEAT_SKILLS_PRESETS.map((c) => c.id);
    setSelectedCheatId(cheatList[Math.floor(Math.random() * cheatList.length)]);

    // Randomize stats
    let remaining = 10;
    const newStats = { str: 10, mag: 10, agi: 10, luk: 10 };
    const keys: (keyof typeof newStats)[] = ['str', 'mag', 'agi', 'luk'];
    while (remaining > 0) {
      const k = keys[Math.floor(Math.random() * keys.length)];
      newStats[k] += 1;
      remaining -= 1;
    }
    setStats(newStats);
    setBonusPoints(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim()) return;

    soundEngine.playCheatActivation();

    onStartGame({
      characterName,
      language: 'en',
      worldArchetype,
      customWorldPrompt: worldArchetype === 'custom' ? customWorldPrompt : undefined,
      reincarnationMethod,
      cheatSkillId: selectedCheatId,
      customCheatPrompt,
      initialStats: stats,
    });
  };

  const getArchetypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sword':
        return <Sword className="w-5 h-5 text-amber-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Skull':
        return <Skull className="w-5 h-5 text-red-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-pink-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  const getReincarnationIcon = (iconName: string) => {
    switch (iconName) {
      case 'Truck':
        return <Truck className="w-5 h-5 text-amber-400" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-yellow-300" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-red-400" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-cyan-400" />;
      default:
        return <Zap className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div id="character-creation-screen" className="min-h-[calc(100vh-80px)] py-8 px-4 flex justify-center items-center">
      <div className="w-full max-w-4xl bento-card border-purple-500/30 p-6 sm:p-8 backdrop-blur-xl">
        
        {/* Header Hero */}
        <div className="text-center mb-8">
          <div className="bento-tag inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/15 text-purple-300 text-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Forge Your New Life</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Isekai Reincarnation Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-2">
            Choose your realm, cause of reincarnation, and ultimate Cheat Skill. Every decision alters world fate!
          </p>

          <button
            type="button"
            id="btn-randomize-all"
            onClick={handleRandomize}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 hover:border-purple-500/50 text-purple-200 text-xs font-bold transition"
          >
            <Dice5 className="w-4 h-4 text-purple-400 animate-spin" />
            <span>Randomize Hero & Fate</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Name Input & Avatar Preview */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={previewAvatarUrl}
                alt={characterName}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-purple-400/60 shadow-xl shadow-purple-950/60"
              />
              <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 rounded-md bg-purple-900 border border-purple-400 text-[10px] font-black text-amber-300">
                Avatar Preview
              </span>
            </div>

            <div className="flex-1 w-full">
              <div className="bento-tag">1. Your Name in the New World</div>
              <input
                id="input-hero-name"
                type="text"
                required
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full bg-black/30 border border-white/15 focus:border-purple-400 rounded-xl px-4 py-3 text-white font-semibold placeholder-slate-500 outline-none transition text-base"
                placeholder="Enter your name..."
              />
            </div>
          </div>

          {/* STEP 2: World Archetype Selection */}
          <div>
            <div className="bento-tag mb-3">
              2. Select World Archetype
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {WORLD_PRESETS.map((preset) => {
                const isSelected = worldArchetype === preset.id;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    id={`world-archetype-${preset.id}`}
                    onClick={() => {
                      soundEngine.playClick();
                      setWorldArchetype(preset.id);
                    }}
                    className={`text-left p-4 rounded-xl border transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-400 text-white'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-lg bg-black/40 border border-white/10">
                          {getArchetypeIcon(preset.iconName)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-purple-300 border border-white/10">
                          {preset.badge['en']}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white mb-1">
                        {preset.title['en']}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {preset.description['en']}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-300 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-purple-400" />
                        <span>Selected</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {worldArchetype === 'custom' && (
              <div className="mt-3 bg-white/[0.03] border border-purple-500/30 rounded-xl p-4">
                <label className="block text-xs font-bold text-purple-300 mb-1">
                  Describe your custom Isekai world:
                </label>
                <textarea
                  id="input-custom-world-prompt"
                  value={customWorldPrompt}
                  onChange={(e) => setCustomWorldPrompt(e.target.value)}
                  rows={2}
                  className="w-full bg-black/30 border border-white/15 focus:border-purple-400 rounded-xl p-2.5 text-xs text-white outline-none"
                  placeholder='e.g. "Floating sky islands where dragon pirates sail through clouds and alchemy is forbidden..."'
                />
              </div>
            )}
          </div>

          {/* STEP 3: Reincarnation Method */}
          <div>
            <div className="bento-tag mb-3">
              3. Cause of Reincarnation
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {REINCARNATION_PRESETS.map((preset) => {
                const isSelected = reincarnationMethod === preset.id;
                return (
                  <button
                    type="button"
                    key={preset.id}
                    id={`reincarnation-method-${preset.id}`}
                    onClick={() => {
                      soundEngine.playClick();
                      setReincarnationMethod(preset.id);
                    }}
                    className={`text-left p-3.5 rounded-xl border transition ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-400 text-white'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="p-1.5 rounded-md bg-black/40 border border-white/10">
                        {getReincarnationIcon(preset.icon)}
                      </span>
                      <h4 className="font-bold text-xs text-slate-200">
                        {preset.title['en']}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {preset.description['en']}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Cheat Skill Selection */}
          <div>
            <div className="bento-tag mb-3 flex items-center justify-between">
              <span>4. Select Legendary Cheat Skill</span>
              <Wand2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHEAT_SKILLS_PRESETS.map((cheat) => {
                const isSelected = selectedCheatId === cheat.id;
                return (
                  <button
                    type="button"
                    key={cheat.id}
                    id={`cheat-skill-${cheat.id}`}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedCheatId(cheat.id);
                    }}
                    className={`text-left p-4 rounded-xl border transition flex items-center gap-3 justify-between ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-400 text-white shadow-md'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <img
                      src={cheat.imageUrl}
                      alt={cheat.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-purple-400/50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-xs text-purple-200 truncate">{cheat.name}</h4>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-black/40 text-purple-300 border border-white/10 shrink-0">
                          {cheat.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal line-clamp-2">{cheat.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 bg-white/[0.03] border border-white/10 rounded-xl p-3.5">
              <label className="block text-xs font-bold text-purple-300 mb-1">
                Or custom Cheat Skill prompt:
              </label>
              <input
                id="input-custom-cheat-prompt"
                type="text"
                value={customCheatPrompt}
                onChange={(e) => setCustomCheatPrompt(e.target.value)}
                className="w-full bg-black/30 border border-white/15 focus:border-purple-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                placeholder='e.g. "Whenever I drink tea, I gain infinite magic power for 5 minutes..."'
              />
            </div>
          </div>

          {/* STEP 5: Stat Points Allocation */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="bento-tag !mb-0">
                  5. Allocate Initial Stats
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  All attributes start at base value 10
                </p>
              </div>
              <div className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/15 text-purple-300 text-xs font-extrabold">
                Bonus Points: {bonusPoints}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Strength (STR)', key: 'str' as const, color: 'text-red-400' },
                { label: 'Magic (MAG)', key: 'mag' as const, color: 'text-cyan-400' },
                { label: 'Agility (AGI)', key: 'agi' as const, color: 'text-emerald-400' },
                { label: 'Luck (LUK)', key: 'luk' as const, color: 'text-amber-400' },
              ].map((item) => (
                <div key={item.key} className="bg-black/30 border border-white/10 rounded-xl p-3 text-center">
                  <span className={`text-xs font-extrabold ${item.color} block mb-1`}>{item.label}</span>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <button
                      type="button"
                      id={`stat-minus-${item.key}`}
                      onClick={() => handleStatChange(item.key, -1)}
                      disabled={stats[item.key] <= 5}
                      className="p-1 rounded bg-white/[0.05] hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-base font-extrabold text-white min-w-[20px]">
                      {stats[item.key]}
                    </span>
                    <button
                      type="button"
                      id={`stat-plus-${item.key}`}
                      onClick={() => handleStatChange(item.key, 1)}
                      disabled={bonusPoints <= 0}
                      className="p-1 rounded bg-white/[0.05] hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 text-center">
            <button
              type="submit"
              id="btn-submit-reincarnate"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-base tracking-wide shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 mx-auto"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Opening Reincarnation Portal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>ENTER THE NEW WORLD!</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
