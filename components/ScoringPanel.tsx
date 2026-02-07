
import React, { useState } from 'react';
import { ROUNDS } from '../constants';
import { Contestant, ScoreSet } from '../types';
import { Save, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  contestant: Contestant;
  judgeName: string;
  existingScores: ScoreSet[];
  onSave: (score: ScoreSet) => void;
  onBack: () => void;
}

const ScoringPanel: React.FC<Props> = ({ contestant, judgeName, existingScores, onSave, onBack }) => {
  const [activeRoundIdx, setActiveRoundIdx] = useState(0);
  
  const [localScores, setLocalScores] = useState<Record<number, Record<string, number>>>(() => {
    const initial: Record<number, Record<string, number>> = {};
    ROUNDS.forEach(r => {
      initial[r.id] = {};
      const existing = existingScores.find(es => es.roundId === r.id);
      r.criteria.forEach(c => {
        initial[r.id][c.id] = existing?.criteriaScores[c.id] || 0;
      });
    });
    return initial;
  });

  const [savedRounds, setSavedRounds] = useState<Set<number>>(new Set(existingScores.map(es => es.roundId)));

  const handleScoreChange = (roundId: number, criterionId: string, value: number) => {
    setLocalScores(prev => ({
      ...prev,
      [roundId]: { ...prev[roundId], [criterionId]: value }
    }));
    // 一旦修改，从已保存集合中移除，提示用户重新提交
    if (savedRounds.has(roundId)) {
      const newSaved = new Set(savedRounds);
      newSaved.delete(roundId);
      setSavedRounds(newSaved);
    }
  };

  const handleSaveRound = (roundId: number) => {
    const scoreSet: ScoreSet = {
      contestantId: contestant.id,
      roundId,
      judgeName,
      criteriaScores: localScores[roundId],
      updatedAt: Date.now()
    };
    onSave(scoreSet);
    setSavedRounds(prev => new Set([...prev, roundId]));
  };

  const activeRound = ROUNDS[activeRoundIdx];
  // Fix: Explicitly type roundTotal as number to resolve 'unknown' type error for toFixed(1)
  const roundTotal: number = Object.values(localScores[activeRound.id] || {}).reduce((sum: number, v: number) => sum + v, 0);

  return (
    <div className="space-y-6 pb-12 animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-4 bg-black text-white p-6 rounded-[2.5rem] shadow-2xl">
        <img src={contestant.image} className="w-20 h-20 rounded-3xl object-cover border-4 border-white/10" alt={contestant.name} />
        <div>
          <h2 className="text-2xl font-black italic">{contestant.name}</h2>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{contestant.title}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scroll-hide pb-2">
        {ROUNDS.map((round, idx) => (
          <button
            key={round.id}
            onClick={() => setActiveRoundIdx(idx)}
            className={`flex-shrink-0 px-6 py-3 rounded-2xl text-xs font-black transition-all uppercase tracking-widest ${
              activeRoundIdx === idx 
              ? 'bg-black text-white shadow-lg' 
              : 'bg-white text-gray-400'
            }`}
          >
            Round {round.id}
            {savedRounds.has(round.id) && <span className="ml-2 text-green-400">●</span>}
          </button>
        ))}
      </div>

      <div className="glass-card p-8 rounded-[3rem] space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-black">{activeRound.title}</h3>
            <p className="text-xs text-gray-400 font-medium">{activeRound.description}</p>
          </div>
          <div className="bg-black text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
            {activeRound.totalMax} pts
          </div>
        </div>

        <div className="space-y-8">
          {activeRound.criteria.map((c) => (
            <div key={c.id} className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-black text-gray-500 uppercase tracking-tighter">{c.name}</label>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-black">{localScores[activeRound.id][c.id]}</span>
                  <span className="text-gray-300 text-xs font-bold">/ {c.maxScore}</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={c.maxScore}
                step="0.1"
                value={localScores[activeRound.id][c.id]}
                onChange={(e) => handleScoreChange(activeRound.id, c.id, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-black"
              />
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-gray-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">当前累计</span>
            <span className="text-4xl font-black text-black italic">{roundTotal.toFixed(1)}</span>
          </div>
          <button
            onClick={() => handleSaveRound(activeRound.id)}
            className={`flex items-center gap-3 px-10 py-5 rounded-[1.5rem] font-black transition-all shadow-xl active:scale-95 ${
              savedRounds.has(activeRound.id)
              ? 'bg-green-500 text-white'
              : 'bg-black text-white'
            }`}
          >
            {savedRounds.has(activeRound.id) ? (
              <><CheckCircle2 size={20} /> 已同步</>
            ) : (
              <><Save size={20} /> 确认提交</>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-4 px-2">
        <button
          disabled={activeRoundIdx === 0}
          onClick={() => setActiveRoundIdx(idx => idx - 1)}
          className="flex-1 py-4 bg-white rounded-2xl text-gray-400 font-bold disabled:opacity-30 flex items-center justify-center gap-2"
        >
          <ChevronLeft size={18} /> 上一轮
        </button>
        <button
          disabled={activeRoundIdx === ROUNDS.length - 1}
          onClick={() => setActiveRoundIdx(idx => idx + 1)}
          className="flex-1 py-4 bg-white rounded-2xl text-gray-400 font-bold disabled:opacity-30 flex items-center justify-center gap-2"
        >
          下一轮 <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ScoringPanel;
