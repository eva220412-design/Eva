
import React, { useState, useMemo } from 'react';
import { ROUNDS } from '../constants';
import { Contestant, ScoreSet } from '../types';
import { ChevronRight, Save, CheckCircle2 } from 'lucide-react';

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
      [roundId]: {
        ...prev[roundId],
        [criterionId]: value
      }
    }));
  };

  const handleSaveRound = (roundId: number) => {
    const scoreSet: ScoreSet = {
      contestantId: contestant.id,
      roundId,
      judgeName,
      criteriaScores: localScores[roundId]
    };
    onSave(scoreSet);
    setSavedRounds(prev => new Set([...prev, roundId]));
    
    // Auto advance if not the last round
    if (activeRoundIdx < ROUNDS.length - 1) {
      setTimeout(() => setActiveRoundIdx(prev => prev + 1), 500);
    }
  };

  const activeRound = ROUNDS[activeRoundIdx];
  // Fix: Explicitly typing reduce arguments to resolve unknown operator '+' error
  const roundTotal = Object.values(localScores[activeRound.id]).reduce((sum: number, v: number) => sum + v, 0);

  return (
    <div className="space-y-6 pb-12 animate-in slide-in-from-right duration-500">
      {/* Contestant Summary Header */}
      <div className="flex items-center gap-4 bg-black text-white p-6 rounded-[2rem] shadow-xl">
        <img src={contestant.image} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20" alt={contestant.name} />
        <div>
          <h2 className="text-xl font-bold">{contestant.name}</h2>
          <p className="text-white/60 text-sm">正在评选：{judgeName}</p>
        </div>
      </div>

      {/* Round Tabs */}
      <div className="flex gap-2 overflow-x-auto scroll-hide pb-2">
        {ROUNDS.map((round, idx) => (
          <button
            key={round.id}
            onClick={() => setActiveRoundIdx(idx)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              activeRoundIdx === idx 
              ? 'bg-black text-white' 
              : 'bg-white text-gray-400 border border-gray-100'
            }`}
          >
            Round {round.id}
            {savedRounds.has(round.id) && <span className="ml-1 text-green-400">●</span>}
          </button>
        ))}
      </div>

      {/* Scoring Form */}
      <div className="glass-card p-6 rounded-[2.5rem] space-y-8">
        <div>
          <h3 className="text-lg font-bold text-black">{activeRound.title}</h3>
          <p className="text-xs text-gray-400 mt-1">{activeRound.description}</p>
        </div>

        <div className="space-y-6">
          {activeRound.criteria.map((c) => (
            <div key={c.id} className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-gray-700">{c.name}</label>
                <span className="text-xl font-black text-black">
                  {localScores[activeRound.id][c.id]} 
                  <span className="text-gray-300 text-sm ml-1">/ {c.maxScore}</span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={c.maxScore}
                step="0.1"
                value={localScores[activeRound.id][c.id]}
                onChange={(e) => handleScoreChange(activeRound.id, c.id, parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-widest">本轮总计</span>
            <span className="text-3xl font-black text-black">{roundTotal.toFixed(1)} <span className="text-sm text-gray-300">/ {activeRound.totalMax}</span></span>
          </div>
          <button
            onClick={() => handleSaveRound(activeRound.id)}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
              savedRounds.has(activeRound.id)
              ? 'bg-green-100 text-green-600'
              : 'bg-black text-white hover:scale-105 active:scale-95 shadow-lg'
            }`}
          >
            {savedRounds.has(activeRound.id) ? (
              <><CheckCircle2 size={20} /> 已提交</>
            ) : (
              <><Save size={20} /> 提交得分</>
            )}
          </button>
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full py-4 text-gray-400 font-medium hover:text-black transition-colors"
      >
        返回主页
      </button>
    </div>
  );
};

export default ScoringPanel;
