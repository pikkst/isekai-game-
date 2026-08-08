import React, { useEffect, useRef } from 'react';
import {
  MapPin,
  Users,
  Swords,
  Sparkles,
} from 'lucide-react';
import { CombatInfo, Companion, Language } from '@isekai/contracts';
import { getSceneImageUrl, getCompanionAvatarUrl } from '@isekai/contracts';

interface StoryViewerProps {
  narrative: string;
  location: string;
  combatInfo?: CombatInfo | null;
  companions: Companion[];
  language: Language;
  imagePrompt?: string;
  sceneImageUrl?: string;
  isLoading: boolean;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  narrative,
  location,
  combatInfo,
  companions,
  sceneImageUrl,
  isLoading,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fallback scene image URL if not passed in
  const sceneUrl = sceneImageUrl || getSceneImageUrl(location || 'Sanctum', narrative);

  // Procedural Scene Illustration Overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      const w = (canvas.width = canvas.offsetWidth || 600);
      const h = (canvas.height = canvas.offsetHeight || 220);

      ctx.clearRect(0, 0, w, h);

      // Glowing floating mana particles
      const isCombat = !!combatInfo;
      for (let i = 0; i < 15; i++) {
        const px = (Math.sin(i * 99 + time * 0.5) * 0.5 + 0.5) * w;
        const py = (Math.cos(i * 33 + time * 0.8) * 0.5 + 0.5) * h;
        const size = Math.sin(i + time) * 2 + 3;

        ctx.fillStyle = isCombat ? 'rgba(248, 113, 113, 0.7)' : 'rgba(251, 191, 36, 0.7)';
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1, size), 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [location, combatInfo]);

  return (
    <div
      id="story-viewer-container"
      className="bento-card overflow-hidden !p-0 border-purple-500/20 bg-gradient-to-b from-purple-900/10 via-white/[0.02] to-transparent"
    >
      {/* Bento Scenario Tag Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
        <div className="bento-tag !mb-0 flex items-center gap-1.5 text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Current Scenario</span>
        </div>

        {/* Location Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/15 text-amber-300 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>{location || 'Unknown Realm'}</span>
        </div>
      </div>

      {/* AI Generated Scene Illustration Banner */}
      <div className="relative h-48 sm:h-60 w-full border-b border-white/10 overflow-hidden bg-black/50">
        <img
          src={sceneUrl}
          alt={location}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-85 transition-all duration-700 hover:scale-105"
        />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />

        {/* Party Companions Bar Overlay with Portraits */}
        {companions.length > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-[#050505]/90 border border-purple-500/30 rounded-xl px-3 py-2 backdrop-blur-md max-w-[90%] flex-wrap">
            <Users className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="flex items-center gap-3">
              {companions.map((comp) => {
                const compAvatar = comp.avatarUrl || getCompanionAvatarUrl(comp.name, comp.role);
                return (
                  <div key={comp.id} className="flex items-center gap-1.5">
                    <img
                      src={compAvatar}
                      alt={comp.name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-purple-400"
                    />
                    <span className="font-semibold text-xs text-slate-200">
                      {comp.name}{' '}
                      <span className="text-[10px] text-amber-400">({comp.loyalty}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading Indicator Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-purple-300 animate-pulse">
              Weaving the threads of destiny...
            </span>
          </div>
        )}
      </div>

      {/* Active Combat Status Banner */}
      {combatInfo && (
        <div className="bg-rose-950/30 border-b border-rose-500/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-900/40 border border-rose-500/50 text-rose-300">
              <Swords className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-rose-200">{combatInfo.enemyName}</h4>
              <p className="text-xs text-rose-300/80">{combatInfo.battleLog}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-rose-400 block mb-1">
              HP: {combatInfo.enemyHp} / {combatInfo.enemyMaxHp}
            </span>
            <div className="stat-bar w-28">
              <div
                className="stat-fill bg-rose-500 rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0, (combatInfo.enemyHp / combatInfo.enemyMaxHp) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Narrative Story Content */}
      <div className="p-5 sm:p-6 space-y-3">
        <div className="text-slate-100 text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line border-l-2 border-purple-500/40 pl-4 py-1">
          {narrative}
        </div>
      </div>
    </div>
  );
};
