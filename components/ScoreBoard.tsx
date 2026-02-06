
import React, { useMemo } from 'react';
import { CONTESTANTS, ROUNDS } from '../constants';
import { ScoreSet } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { BarChart3, Trophy, Share2, Users } from 'lucide-react';

interface Props {
  allScores: ScoreSet[];
}

const ScoreBoard: React.FC<Props> = ({ allScores }) => {
  const rankingData = useMemo(() => {
    return CONTESTANTS.map(c => {
      const scores = allScores.filter(s => s.contestantId === c.id);
      
      // Aggregate scores from all 5 potential judges
      const totalScore = scores.reduce((sum, s) => {
        const val = Object.values(s.criteriaScores).reduce((acc: number, v: number) => acc + v, 0);
        return sum + val;
      }, 0);

      // Track how many unique judges contributed
      const contributingJudges = new Set(scores.map(s => s.judgeIndex));

      const roundAggregates = ROUNDS.map(r => {
        const rScores = scores.filter(s => s.roundId === r.id);
        const rSum = rScores.reduce((sum, s) => sum + Object.values(s.criteriaScores).reduce((acc: number, v: number) => acc + v, 0), 0);
        return { 
          title: r.title, 
          score: contributingJudges.size > 0 ? rSum / contributingJudges.size : 0, // Individual average for this round
          total: rSum 
        };
      });

      return {
        ...c,
        totalScore,
        judgeCount: contributingJudges.size,
        roundAggregates
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [allScores]);

  if (allScores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-10">
        <div className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center mb-6">
          <BarChart3 size={40} className="text-gray-300" />
        </div>
        <h3 className="text-2xl font-black text-black mb-2 italic">等待评分...</h3>
        <p className="text-gray-400 text-sm">一旦有评委提交分数，总榜将实时更新。</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-12">
      {/* Dynamic Summary Bar */}
      <div className="glass-card p-8 rounded-[2.5rem] shadow-inner border-b-8 border-b-black/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">全场总冠军趋势</h3>
          <div className="flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded-full">
            <Trophy size={10} />
            <span className="text-[10px] font-bold">LIVE</span>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankingData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 900}} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)'}}
              />
              <Bar dataKey="totalScore" radius={[12, 12, 0, 0]}>
                {rankingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#000' : '#E5E7EB'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-4">
        {rankingData.map((c, idx) => (
          <div key={c.id} className="bg-white rounded-[3rem] p-6 shadow-sm border border-gray-100 transition-all hover:shadow-xl">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img src={c.image} className="w-20 h-20 rounded-[1.8rem] object-cover" alt={c.name} />
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-black italic border-4 border-white ${
                  idx === 0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {idx + 1}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <h4 className="text-xl font-black text-black leading-none">{c.name}</h4>
                  <div className="text-right">
                    <span className="text-3xl font-black italic block">{c.totalScore.toFixed(1)}</span>
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-none">AGGREGATE SCORE</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <Users size={12} />
                    <span>{c.judgeCount} 位评委已评分</span>
                  </div>
                  <div className="flex-1 h-1 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-black transition-all duration-1000" style={{width: `${(c.judgeCount/5)*100}%`}} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-rounds breakdown */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-50">
               {c.roundAggregates.map((ra, ridx) => (
                 <div key={ridx} className="text-center">
                    <p className="text-[8px] font-bold text-gray-300 uppercase mb-1 truncate">{ra.title.split('：')[0]}</p>
                    <p className="text-sm font-black text-black">{ra.total.toFixed(1)}</p>
                    <div className="text-[8px] font-bold text-gray-400 mt-1">Avg: {ra.score.toFixed(1)}</div>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>

      <button 
        className="w-full py-5 bg-black text-white rounded-[2rem] font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
        onClick={() => {
          const summary = rankingData.map((c, i) => `${i+1}. ${c.name} (${c.totalScore.toFixed(1)}分)`).join('\n');
          if (navigator.share) {
            navigator.share({ title: 'SINGER 2026 最终排名', text: summary });
          } else {
            alert(summary);
          }
        }}
      >
        <Share2 size={20} />
        生成分享战报
      </button>
    </div>
  );
};

export default ScoreBoard;
