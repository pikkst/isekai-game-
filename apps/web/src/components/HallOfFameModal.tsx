import React from 'react';
import { Trophy, X, Sparkles, Trash2 } from 'lucide-react';
import { HallOfFameRecord, Language } from '@isekai/contracts';
import { soundEngine } from '../utils/soundEngine';
import { getCharacterAvatarUrl } from '@isekai/contracts';

interface HallOfFameModalProps {
  records: HallOfFameRecord[];
  language: Language;
  onClose: () => void;
  onClearRecords: () => void;
}

export const HallOfFameModal: React.FC<HallOfFameModalProps> = ({
  records,
  onClose,
  onClearRecords,
}) => {
  return (
    <div id="modal-hall-of-fame-backdrop" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h3 className="font-extrabold text-lg text-slate-100">
              Hall of Reincarnations
            </h3>
          </div>
          <button
            type="button"
            id="btn-close-hall-of-fame"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Records List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {records.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs">
                No past reincarnations recorded yet. Begin your first life!
              </p>
            </div>
          ) : (
            records.map((rec) => {
              const avatar = rec.avatarUrl || getCharacterAvatarUrl(rec.characterName, rec.archetype);
              return (
                <div
                  key={rec.id}
                  className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={avatar}
                      alt={rec.characterName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-purple-500/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-amber-300 truncate">{rec.characterName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-semibold border border-purple-800 shrink-0">
                          Lvl {rec.finalLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {rec.worldName} ({rec.archetype})
                      </p>
                      <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">{rec.summary}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-cyan-400 block">{rec.endingType}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {rec.turnsSurvived} turns
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {records.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <button
              type="button"
              id="btn-clear-records"
              onClick={() => {
                if (confirm('Clear all Hall of Fame history?')) {
                  onClearRecords();
                }
              }}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Records</span>
            </button>
            <span className="text-slate-500">
              {records.length} reincarnations logged
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
