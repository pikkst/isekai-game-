import React from 'react';
import {
  Zap,
  Heart,
  Sparkles,
  Flame,
  Award,
  Crown,
  Dumbbell,
  Wand,
  Feather,
  Clover,
} from 'lucide-react';
import { CharacterStats, CheatSkill, Language } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { getCharacterAvatarUrl } from '../utils/imageGenerator';

interface StatusCardProps {
  stats: CharacterStats;
  cheatSkill: CheatSkill;
  language: Language;
  onUseCheatSkill: () => void;
  onSpendFatePoint: () => void;
  onAllocateStat?: (stat: 'str' | 'mag' | 'agi' | 'luk') => void;
  isLoading: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  stats,
  cheatSkill,
  onUseCheatSkill,
  onSpendFatePoint,
  onAllocateStat,
  isLoading,
}) => {
  const hpPct = Math.min(100, Math.max(0, (stats.hp / stats.maxHp) * 100));
  const mpPct = Math.min(100, Math.max(0, (stats.mp / stats.maxMp) * 100));
  const expPct = Math.min(100, Math.max(0, (stats.exp / stats.maxExp) * 100));

  // Karma calculation (-100 to +100)
  const karmaNormalized = ((stats.karma + 100) / 200) * 100; // 0 to 100%
  const karmaTitle =
    stats.karma >= 50
      ? 'Holy Hero'
      : stats.karma <= -50
      ? 'Dark Sovereign'
      : 'Neutral Wanderer';

  // Get persistent character avatar URL
  const avatarUrl = stats.avatarUrl || getCharacterAvatarUrl(stats.name, 'high_fantasy');

  return (
    <div id="status-card-container" className="bento-card space-y-4">
      {/* Bento Tag */}
      <div className="bento-tag flex justify-between items-center mb-0">
        <span>Character Profile</span>
        <button
          type="button"
          id="btn-spend-fate-point"
          onClick={() => {
            soundEngine.playClick();
            onSpendFatePoint();
          }}
          disabled={stats.fatePoints <= 0 || isLoading}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/15 hover:border-amber-400 text-amber-300 text-xs font-bold transition disabled:opacity-40 disabled:pointer-events-none"
          title="Use Fate Point for divine miracle"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>
            Fate Points: {stats.fatePoints}
          </span>
        </button>
      </div>

      {/* Profile Header with Avatar Image */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={stats.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-purple-500/40 shadow-lg shadow-purple-950/50"
          />
          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-purple-900 border border-purple-400 text-[10px] font-black text-amber-300">
            Lvl {stats.level}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-base sm:text-lg text-white truncate">{stats.name}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800 shrink-0">
              {stats.title || 'Reincarnator'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mt-1">
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{karmaTitle}</span>
          </div>
        </div>
      </div>

      {/* Vitals Bars: HP, MP, EXP */}
      <div className="space-y-3">
        {/* Health Bar */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-0.5">
            <span className="text-red-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> HP
            </span>
            <span className="text-slate-300">
              {stats.hp} / {stats.maxHp}
            </span>
          </div>
          <div className="stat-bar">
            <div
              className="stat-fill bg-red-500 rounded-full"
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

        {/* Mana Bar */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-0.5">
            <span className="text-blue-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> MP
            </span>
            <span className="text-slate-300">
              {stats.mp} / {stats.maxMp}
            </span>
          </div>
          <div className="stat-bar">
            <div
              className="stat-fill bg-blue-500 rounded-full"
              style={{ width: `${mpPct}%` }}
            />
          </div>
        </div>

        {/* EXP Bar */}
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-0.5">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-400" /> EXP
            </span>
            <span>
              {stats.exp} / {stats.maxExp}
            </span>
          </div>
          <div className="stat-bar">
            <div
              className="stat-fill bg-purple-500 rounded-full"
              style={{ width: `${expPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Attributes Grid & Stat Allocation */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        {stats.statPoints && stats.statPoints > 0 ? (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold animate-pulse">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Stat Points Available:
            </span>
            <span className="text-xs font-black text-amber-200">{stats.statPoints}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-4 gap-2">
          {/* STR */}
          <div className="bg-white/[0.03] rounded-xl p-2 text-center border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-red-400 font-bold flex items-center justify-center gap-0.5">
              <Dumbbell className="w-3 h-3" /> STR
            </span>
            <span className="text-xs font-extrabold text-slate-100 my-0.5 block">{stats.str}</span>
            {stats.statPoints && stats.statPoints > 0 && onAllocateStat && (
              <button
                type="button"
                id="btn-add-str"
                onClick={() => {
                  soundEngine.playClick();
                  onAllocateStat('str');
                }}
                className="w-full py-0.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 text-[10px] font-black rounded border border-red-500/40 transition"
              >
                +1
              </button>
            )}
          </div>

          {/* MAG */}
          <div className="bg-white/[0.03] rounded-xl p-2 text-center border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-cyan-400 font-bold flex items-center justify-center gap-0.5">
              <Wand className="w-3 h-3" /> MAG
            </span>
            <span className="text-xs font-extrabold text-slate-100 my-0.5 block">{stats.mag}</span>
            {stats.statPoints && stats.statPoints > 0 && onAllocateStat && (
              <button
                type="button"
                id="btn-add-mag"
                onClick={() => {
                  soundEngine.playClick();
                  onAllocateStat('mag');
                }}
                className="w-full py-0.5 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 text-[10px] font-black rounded border border-cyan-500/40 transition"
              >
                +1
              </button>
            )}
          </div>

          {/* AGI */}
          <div className="bg-white/[0.03] rounded-xl p-2 text-center border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-0.5">
              <Feather className="w-3 h-3" /> AGI
            </span>
            <span className="text-xs font-extrabold text-slate-100 my-0.5 block">{stats.agi}</span>
            {stats.statPoints && stats.statPoints > 0 && onAllocateStat && (
              <button
                type="button"
                id="btn-add-agi"
                onClick={() => {
                  soundEngine.playClick();
                  onAllocateStat('agi');
                }}
                className="w-full py-0.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-[10px] font-black rounded border border-emerald-500/40 transition"
              >
                +1
              </button>
            )}
          </div>

          {/* LUK */}
          <div className="bg-white/[0.03] rounded-xl p-2 text-center border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] text-amber-400 font-bold flex items-center justify-center gap-0.5">
              <Clover className="w-3 h-3" /> LUK
            </span>
            <span className="text-xs font-extrabold text-slate-100 my-0.5 block">{stats.luk}</span>
            {stats.statPoints && stats.statPoints > 0 && onAllocateStat && (
              <button
                type="button"
                id="btn-add-luk"
                onClick={() => {
                  soundEngine.playClick();
                  onAllocateStat('luk');
                }}
                className="w-full py-0.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-[10px] font-black rounded border border-amber-500/40 transition"
              >
                +1
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Karma Alignment Gauge */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-2.5">
        <div className="flex justify-between text-[10px] font-bold mb-1">
          <span className="text-purple-400">Demonic</span>
          <span className="text-amber-300">
            Karma: {stats.karma > 0 ? `+${stats.karma}` : stats.karma}
          </span>
          <span className="text-amber-400">Holy</span>
        </div>
        <div className="stat-bar relative">
          <div
            className="absolute top-0 bottom-0 w-2 bg-amber-400 rounded-full shadow-md shadow-amber-400"
            style={{ left: `calc(${karmaNormalized}% - 4px)` }}
          />
        </div>
      </div>

      {/* Cheat Skill Card & Trigger */}
      <div className="bg-white/[0.03] border border-purple-500/30 rounded-xl p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {cheatSkill.imageUrl ? (
            <img
              src={cheatSkill.imageUrl}
              alt={cheatSkill.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-lg object-cover border border-purple-400/50 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-purple-900/50 border border-purple-400/50 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <h4 className="font-extrabold text-xs text-amber-200 truncate">{cheatSkill.name}</h4>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{cheatSkill.description}</p>
          </div>
        </div>

        <button
          type="button"
          id="btn-trigger-cheat-skill"
          onClick={() => {
            soundEngine.playCheatActivation();
            onUseCheatSkill();
          }}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition shadow-md whitespace-nowrap disabled:opacity-50 shrink-0"
        >
          UNLEASH
        </button>
      </div>
    </div>
  );
};
