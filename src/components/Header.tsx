import React from 'react';
import { Volume2, VolumeX, Globe, Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenHallOfFame: () => void;
  onRestartGame: () => void;
  isPlaying: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onOpenHallOfFame,
  onRestartGame,
  isPlaying,
}) => {
  const [soundOn, setSoundOn] = React.useState(soundEngine.soundEnabled);

  const handleToggleSound = () => {
    const newState = soundEngine.toggleSound();
    setSoundOn(newState);
    if (newState) {
      soundEngine.playClick();
    }
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title / Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              ISEKAI: REBORN <span className="text-purple-400 font-mono text-sm font-normal">[v1.4.2]</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Fate & World Evolution
            </p>
          </div>
        </div>

        {/* Bento Header Stats & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
          {/* Hall of Fame */}
          <button
            id="btn-hall-of-fame"
            onClick={() => {
              soundEngine.playClick();
              onOpenHallOfFame();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 hover:border-amber-500/50 text-amber-300 text-xs font-semibold transition"
            title="Hall of Reincarnations"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">
              Hall of Fame
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-white/[0.05] border border-white/15 hover:border-purple-500/50 text-slate-300 hover:text-white transition"
            title={soundOn ? 'Mute' : 'Unmute'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Language Indicator */}
          <div
            id="btn-language-toggle"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/15 text-slate-200 text-xs font-semibold"
          >
            <Globe className="w-4 h-4 text-purple-400" />
            <span>ENGLISH</span>
          </div>

          {/* Restart Button */}
          {isPlaying && (
            <button
              id="btn-restart-life"
              onClick={() => {
                soundEngine.playClick();
                if (confirm('Are you sure you want to start a new reincarnation?')) {
                  onRestartGame();
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-medium transition"
              title="New Life"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Rebirth</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
