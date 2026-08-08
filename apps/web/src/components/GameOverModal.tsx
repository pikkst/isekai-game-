import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, RotateCcw } from 'lucide-react';
import { CharacterStats, WorldState, Language } from '@isekai/contracts';
import { soundEngine } from '../utils/soundEngine';

interface GameOverModalProps {
  gameEndType: 'victory' | 'defeat' | 'ascension' | 'peaceful' | null;
  stats: CharacterStats;
  world: WorldState;
  turnCount: number;
  language: Language;
  onRestart: () => void;
  onOpenHallOfFame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameEndType,
  stats,
  world,
  turnCount,
  onRestart,
  onOpenHallOfFame,
}) => {
  const isVictory = gameEndType === 'victory' || gameEndType === 'ascension' || gameEndType === 'peaceful';

  useEffect(() => {
    if (isVictory) {
      soundEngine.playLevelUp();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.warn('Confetti fail silently', e);
      }
    } else {
      soundEngine.playGameOver();
    }
  }, [isVictory]);

  return (
    <div id="modal-game-over-backdrop" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        {/* Icon Header */}
        <div className="flex justify-center">
          <div
            className={`w-20 h-20 rounded-2xl p-[2px] shadow-xl flex items-center justify-center ${
              isVictory
                ? 'bg-gradient-to-tr from-amber-400 via-purple-500 to-cyan-400'
                : 'bg-gradient-to-tr from-red-600 to-slate-800'
            }`}
          >
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              {isVictory ? (
                <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
              ) : (
                <Skull className="w-10 h-10 text-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Title & Headline */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-200 via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            {isVictory
              ? 'VICTORY & ASCENSION!'
              : 'JOURNEY ENDED'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {isVictory
              ? `You attained legendary immortal status at Level ${stats.level}!`
              : `Your brave attempt ended at Level ${stats.level} after ${turnCount} decisions.`}
          </p>
        </div>

        {/* Stats Summary Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Hero Name:</span>
            <span className="font-bold text-amber-300">{stats.name}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Title:</span>
            <span className="font-bold text-purple-300">{stats.title || 'Master'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">World:</span>
            <span className="font-bold text-cyan-300">{world.worldName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Turns Survived:</span>
            <span className="font-bold text-slate-200">{turnCount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            id="btn-modal-restart"
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reincarnate Again</span>
          </button>

          <button
            type="button"
            id="btn-modal-hall-of-fame"
            onClick={onOpenHallOfFame}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-purple-500/40 text-purple-300 font-extrabold text-xs transition flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Hall of Fame</span>
          </button>
        </div>
      </div>
    </div>
  );
};
