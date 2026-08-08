import React, { useState } from 'react';
import {
  Swords,
  Users,
  EyeOff,
  Flame,
  Sparkles,
  Compass,
  Send,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { GameTurnChoice, Language } from '@isekai/contracts';
import { soundEngine } from '../utils/soundEngine';

interface ChoicesPanelProps {
  choices: GameTurnChoice[];
  language: Language;
  onSelectChoice: (choiceId: string) => void;
  onSubmitCustomAction: (customText: string) => void;
  onRerollChoices?: () => void;
  fatePoints: number;
  isLoading: boolean;
}

export const ChoicesPanel: React.FC<ChoicesPanelProps> = ({
  choices,
  onSelectChoice,
  onSubmitCustomAction,
  onRerollChoices,
  fatePoints,
  isLoading,
}) => {
  const [customText, setCustomText] = useState('');

  const handleChoiceClick = (choiceId: string, type: string) => {
    if (isLoading) return;
    if (type === 'combat') soundEngine.playSwordSlash();
    else if (type === 'cheat') soundEngine.playCheatActivation();
    else soundEngine.playClick();

    onSelectChoice(choiceId);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || isLoading) return;

    soundEngine.playClick();
    onSubmitCustomAction(customText.trim());
    setCustomText('');
  };

  const getChoiceIcon = (type: string) => {
    switch (type) {
      case 'combat':
        return <Swords className="w-4 h-4 text-red-400" />;
      case 'diplomacy':
        return <Users className="w-4 h-4 text-cyan-400" />;
      case 'stealth':
        return <EyeOff className="w-4 h-4 text-emerald-400" />;
      case 'cheat':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'fate':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Compass className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'safe':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <ShieldCheck className="w-3 h-3" /> Safe
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
            <Zap className="w-3 h-3" /> Moderate
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800">
            <AlertTriangle className="w-3 h-3" /> High Risk
          </span>
        );
      case 'extreme':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-950/90 text-red-200 border border-red-600 animate-pulse">
            <Flame className="w-3 h-3" /> Extreme Fate
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="choices-panel-container" className="bento-card space-y-4">
      {/* Choice Panel Bento Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="bento-tag !mb-0 flex items-center gap-2">
          <Compass className="w-4 h-4 text-purple-400" />
          <span>Fate Choices</span>
        </div>

        {onRerollChoices && (
          <button
            type="button"
            id="btn-reroll-choices"
            onClick={() => {
              soundEngine.playClick();
              onRerollChoices();
            }}
            disabled={fatePoints <= 0 || isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/15 hover:border-amber-400 text-purple-300 hover:text-amber-300 text-xs font-semibold transition disabled:opacity-40 disabled:pointer-events-none"
            title="Spend Fate Point to regenerate choices"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reroll Options</span>
          </button>
        )}
      </div>

      {/* Structured Choice Options Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {choices.map((choice, idx) => (
          <button
            type="button"
            key={choice.id || idx}
            id={`choice-option-${idx}`}
            onClick={() => handleChoiceClick(choice.id, choice.type)}
            disabled={isLoading}
            className="choice-btn group flex items-start justify-between gap-3 disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="flex items-start gap-3">
              <span className="p-1.5 rounded-lg bg-white/[0.05] border border-white/10 group-hover:border-purple-500/40 transition shrink-0 mt-0.5">
                {getChoiceIcon(choice.type)}
              </span>
              <div>
                <p className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-white leading-snug">
                  {choice.text}
                </p>
              </div>
            </div>
            <div className="shrink-0">{getRiskBadge(choice.risk)}</div>
          </button>
        ))}
      </div>

      {/* Custom Player Action Input Box */}
      <div className="pt-2 border-t border-white/10">
        <form onSubmit={handleCustomSubmit} className="space-y-2">
          <label className="block text-xs font-bold text-slate-400">
            Or type your custom action:
          </label>
          <div className="flex gap-2">
            <input
              id="input-custom-action-text"
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-white/[0.05] border border-white/15 focus:border-purple-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
              placeholder='e.g. "I attempt to persuade the dragon using my ancient song..."'
            />
            <button
              type="submit"
              id="btn-submit-custom-action"
              disabled={!customText.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:pointer-events-none"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Execute</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
