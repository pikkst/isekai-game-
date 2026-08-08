import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Compass,
  Clock,
  Sparkles,
  Zap,
  Sword,
  Wand2,
  Shield,
  Award,
  Heart,
  Gift,
  BookOpen,
  Crown,
} from 'lucide-react';
import {
  CharacterStats,
  Equipment,
  InventoryItem,
  Companion,
  WorldState,
  TimelineNode,
  Skill,
  StoryMemory,
} from '@isekai/contracts';
import { soundEngine } from '../utils/soundEngine';
import { getItemImageUrl, getCompanionAvatarUrl } from '@isekai/contracts';

interface TabsDrawerProps {
  stats: CharacterStats;
  equipment: Equipment;
  inventory: InventoryItem[];
  companions: Companion[];
  skills: Skill[];
  skillTreeNodes: Skill[];
  world: WorldState;
  timeline: TimelineNode[];
  memoryLogs?: StoryMemory[];
  onUseItem: (itemId: string) => void;
  onUnlockSkill: (skillId: string) => void;
  onTrainCompanion: (companionId: string) => void;
  onGiftCompanion?: (companionId: string) => void;
  onRomanceCompanion?: (companionId: string) => void;
}

export const TabsDrawer: React.FC<TabsDrawerProps> = ({
  stats,
  equipment,
  inventory,
  companions,
  skills,
  skillTreeNodes,
  world,
  timeline,
  memoryLogs = [],
  onUseItem,
  onUnlockSkill,
  onTrainCompanion,
  onGiftCompanion,
  onRomanceCompanion,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'skills' | 'harem' | 'world' | 'memories'>('inventory');
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'might' | 'magic' | 'shadow' | 'divine'>('all');
  const [memoryFilter, setMemoryFilter] = useState<'all' | 'romance' | 'battle' | 'secret' | 'vow'>('all');

  const filteredTreeNodes = selectedBranch === 'all'
    ? skillTreeNodes
    : skillTreeNodes.filter((node) => node.treeBranch === selectedBranch);

  const filteredMemories = memoryFilter === 'all'
    ? memoryLogs
    : memoryLogs.filter((m) => m.category === memoryFilter);

  return (
    <div id="tabs-drawer-container" className="bento-card space-y-4">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-none">
        <button
          type="button"
          id="tab-btn-inventory"
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('inventory');
          }}
          className={`flex-1 min-w-[70px] py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'inventory'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Items</span>
        </button>

        <button
          type="button"
          id="tab-btn-skills"
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('skills');
          }}
          className={`flex-1 min-w-[75px] py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 relative ${
            activeTab === 'skills'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Skills</span>
          {stats.skillPoints && stats.skillPoints > 0 ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-1" />
          ) : null}
        </button>

        <button
          type="button"
          id="tab-btn-harem"
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('harem');
          }}
          className={`flex-1 min-w-[85px] py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'harem'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>Harem</span>
        </button>

        <button
          type="button"
          id="tab-btn-world"
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('world');
          }}
          className={`flex-1 min-w-[70px] py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'world'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>World</span>
        </button>

        <button
          type="button"
          id="tab-btn-memories"
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('memories');
          }}
          className={`flex-1 min-w-[85px] py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
            activeTab === 'memories'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Memories</span>
        </button>
      </div>

      {/* TAB 1: Inventory & Equipment */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Equipment Slots */}
          <div className="bento-tag !mb-2">Equipped Gear</div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 grid grid-cols-3 gap-2">
            <div className="bg-black/30 p-2 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold block">Weapon:</span>
              <span className="text-xs font-semibold text-amber-300 line-clamp-1">
                {equipment.weapon || 'Steel Blade'}
              </span>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold block">Armor:</span>
              <span className="text-xs font-semibold text-cyan-300 line-clamp-1">
                {equipment.armor || 'Traveler Mantle'}
              </span>
            </div>
            <div className="bg-black/30 p-2 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold block">Accessory:</span>
              <span className="text-xs font-semibold text-purple-300 line-clamp-1">
                {equipment.accessory || 'Sanctum Crystal'}
              </span>
            </div>
          </div>

          {/* Item List */}
          <div>
            <div className="bento-tag flex justify-between items-center mb-2">
              <span>Inventory Items</span>
              <span className="text-purple-400 font-bold">({inventory.length})</span>
            </div>

            {inventory.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 text-center bg-white/[0.02] rounded-xl border border-white/5">
                Your bag is currently empty.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {inventory.map((item) => {
                  const itemImg = item.imageUrl || getItemImageUrl(item.name, item.type);
                  return (
                    <div
                      key={item.id}
                      className="bg-white/[0.03] border border-white/10 p-2.5 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={itemImg}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover border border-purple-500/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-200 truncate">{item.name}</span>
                            <span className="text-[10px] text-amber-400 font-extrabold shrink-0">x{item.count}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                        </div>
                      </div>

                      {item.type === 'potion' && (
                        <button
                          type="button"
                          id={`btn-use-item-${item.id}`}
                          onClick={() => {
                            soundEngine.playMagicSpell();
                            onUseItem(item.id);
                          }}
                          className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[11px] font-bold transition shrink-0"
                        >
                          Use
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Skill Tree & Abilities */}
      {activeTab === 'skills' && (
        <div className="space-y-3">
          {/* Skill Points Banner */}
          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <div>
                <h4 className="font-extrabold text-xs text-amber-200">Skill Tree Mastery</h4>
                <p className="text-[11px] text-slate-400">Unlock technique branches & passive stat boosts</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-amber-400/20 border border-amber-400/50 rounded-lg text-amber-300 font-black text-xs">
              Skill Points: {stats.skillPoints || 0}
            </div>
          </div>

          {/* Branch Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: 'all' as const, label: 'All', icon: Zap },
              { key: 'might' as const, label: 'Might', icon: Sword },
              { key: 'magic' as const, label: 'Magic', icon: Wand2 },
              { key: 'shadow' as const, label: 'Shadow', icon: Shield },
              { key: 'divine' as const, label: 'Divine', icon: Award },
            ].map((branch) => {
              const IconComp = branch.icon;
              const isActive = selectedBranch === branch.key;
              return (
                <button
                  key={branch.key}
                  type="button"
                  onClick={() => setSelectedBranch(branch.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                    isActive
                      ? 'bg-purple-500 text-slate-950 font-black'
                      : 'bg-white/[0.05] text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <IconComp className="w-3 h-3" />
                  <span>{branch.label}</span>
                </button>
              );
            })}
          </div>

          {/* Skill Nodes Grid */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filteredTreeNodes.map((node) => {
              const isUnlocked = skills.some((s) => s.id === node.id || s.name === node.name) || node.unlocked;
              const meetsLevel = stats.level >= (node.requiredLevel || 1);
              const hasPoints = (stats.skillPoints || 0) >= (node.costPoints || 1);
              const canUnlock = !isUnlocked && meetsLevel && hasPoints;

              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isUnlocked
                      ? 'bg-purple-950/40 border-purple-500/50 text-white'
                      : meetsLevel
                      ? 'bg-white/[0.03] border-white/10 text-slate-300'
                      : 'bg-black/40 border-white/5 opacity-60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={node.imageUrl || getItemImageUrl(node.name, 'artifact')}
                      alt={node.name}
                      referrerPolicy="no-referrer"
                      className={`w-10 h-10 rounded-lg object-cover border shrink-0 ${
                        isUnlocked ? 'border-amber-400/80 shadow-md shadow-amber-500/20' : 'border-slate-700'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="font-bold text-xs text-amber-200 truncate">{node.name}</h5>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-purple-300 border border-white/10 uppercase tracking-wider shrink-0 font-extrabold">
                          {node.treeBranch || 'skill'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{node.description}</p>
                      {node.statBonus && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 mt-1">
                          {node.statBonus.str && <span>+ {node.statBonus.str} STR</span>}
                          {node.statBonus.mag && <span>+ {node.statBonus.mag} MAG</span>}
                          {node.statBonus.agi && <span>+ {node.statBonus.agi} AGI</span>}
                          {node.statBonus.luk && <span>+ {node.statBonus.luk} LUK</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {isUnlocked ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                        ✓ Unlocked
                      </span>
                    ) : (
                      <button
                        type="button"
                        id={`btn-unlock-skill-${node.id}`}
                        disabled={!canUnlock}
                        onClick={() => {
                          soundEngine.playLevelUp();
                          onUnlockSkill(node.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                          canUnlock
                            ? 'bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 shadow-md cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <span>Unlock</span>
                        <span className="text-[10px] opacity-80">({node.costPoints || 1} SP, Lvl {node.requiredLevel})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Harem & Romance Hub */}
      {activeTab === 'harem' && (
        <div className="space-y-3">
          <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-rose-400 animate-bounce" />
              <div>
                <h4 className="font-extrabold text-xs text-rose-200">Harem & Romance Sanctuary</h4>
                <p className="text-[11px] text-slate-400">Deepen soul bonds, give romantic gifts, & unlock synergy</p>
              </div>
            </div>
            <div className="px-2.5 py-1 bg-rose-500/20 border border-rose-500/40 rounded-lg text-rose-300 font-bold text-xs">
              Count: {companions.length}
            </div>
          </div>

          {companions.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 text-center bg-white/[0.02] rounded-xl border border-white/5">
              No soulmates or harem companions bonded yet. Explore the realm and make heroic impressions to recruit!
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {companions.map((comp) => {
                const avatar = comp.avatarUrl || getCompanionAvatarUrl(comp.name, comp.role);
                const cLevel = comp.level || 1;
                const cExp = comp.exp || 0;
                const cMaxExp = comp.maxExp || 100;
                const expPct = Math.min(100, (cExp / cMaxExp) * 100);
                const affection = comp.affection || 50;
                const romanceStatus = comp.romanceStatus || 'Ally';

                return (
                  <div
                    key={comp.id}
                    className="bg-white/[0.03] border border-rose-500/20 p-3 rounded-xl space-y-2.5 hover:border-rose-500/40 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={avatar}
                          alt={comp.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border-2 border-rose-400/80 shadow-md shadow-rose-500/20 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-extrabold text-xs text-rose-200 truncate">{comp.name}</h5>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 font-black border border-rose-800 shrink-0 flex items-center gap-1">
                              <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                              {romanceStatus}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-purple-300 font-bold border border-white/10 shrink-0">
                              Lvl {cLevel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">{comp.status}</p>
                          {comp.favoriteGift && (
                            <p className="text-[10px] text-amber-400 font-medium">
                              Favorite Gift: <span className="font-bold text-amber-200">{comp.favoriteGift}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Affection & EXP Meters */}
                    <div className="grid grid-cols-2 gap-2 bg-black/30 p-2 rounded-lg border border-white/5 text-[10px]">
                      <div>
                        <div className="flex justify-between font-bold text-rose-300 mb-0.5">
                          <span>Affection Meter</span>
                          <span>{affection}%</span>
                        </div>
                        <div className="stat-bar">
                          <div
                            className="stat-fill bg-gradient-to-r from-rose-500 to-amber-400 rounded-full"
                            style={{ width: `${affection}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold text-purple-300 mb-0.5">
                          <span>Companion EXP</span>
                          <span>{cExp}/{cMaxExp}</span>
                        </div>
                        <div className="stat-bar">
                          <div
                            className="stat-fill bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                            style={{ width: `${expPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                      <button
                        type="button"
                        id={`btn-gift-${comp.id}`}
                        onClick={() => {
                          soundEngine.playMagicSpell();
                          if (onGiftCompanion) onGiftCompanion(comp.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <Gift className="w-3 h-3 text-rose-400" />
                        <span>Give Gift (+15 Affection)</span>
                      </button>

                      <button
                        type="button"
                        id={`btn-romance-${comp.id}`}
                        onClick={() => {
                          soundEngine.playLevelUp();
                          if (onRomanceCompanion) onRomanceCompanion(comp.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-slate-950 text-[11px] font-black transition shadow-md flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3 fill-slate-950" />
                        <span>Confess / Date</span>
                      </button>

                      <button
                        type="button"
                        id={`btn-train-${comp.id}`}
                        onClick={() => {
                          soundEngine.playClick();
                          onTrainCompanion(comp.id);
                        }}
                        className="px-2 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-bold transition"
                      >
                        Train Lvl
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: World & Faction Standings */}
      {activeTab === 'world' && (
        <div className="space-y-3">
          <div className="bento-tag">World Development</div>
          <div className="bg-white/[0.03] border border-white/10 p-3 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-cyan-300">{world.worldName}</span>
              <span className="text-[10px] font-bold text-rose-400">
                Threat Level: {world.threatLevel}/100
              </span>
            </div>

            {/* Threat Meter */}
            <div className="stat-bar">
              <div
                className="stat-fill bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full"
                style={{ width: `${world.threatLevel}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">{world.worldEventSummary}</p>
          </div>
        </div>
      )}

      {/* TAB 5: Story Memory Archive */}
      {activeTab === 'memories' && (
        <div className="space-y-3">
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <div>
                <h4 className="font-extrabold text-xs text-amber-200">Reincarnation Memory Vault</h4>
                <p className="text-[11px] text-slate-400">Key historic moments & romantic promises remembered by AI</p>
              </div>
            </div>
            <div className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 font-bold text-xs">
              {memoryLogs.length} Records
            </div>
          </div>

          {/* Memory Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: 'all' as const, label: 'All' },
              { key: 'romance' as const, label: 'Romance' },
              { key: 'battle' as const, label: 'Battles' },
              { key: 'secret' as const, label: 'Secrets' },
              { key: 'vow' as const, label: 'Vows' },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setMemoryFilter(f.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  memoryFilter === f.key
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-white/[0.05] text-slate-400 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {filteredMemories.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 text-center bg-white/[0.02] rounded-xl border border-white/5">
                No memories found in this category yet.
              </p>
            ) : (
              filteredMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="bg-white/[0.03] border border-amber-500/20 p-2.5 rounded-xl space-y-1 text-xs"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-black text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Turn #{mem.turnNumber}: {mem.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/40 text-amber-200 border border-amber-500/30 font-bold uppercase tracking-wider text-[9px]">
                      {mem.category}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{mem.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
