
import React, { useMemo } from 'react';
import { CONTESTANTS, ROUNDS } from '../constants';
import { ScoreSet } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
// Add import for BarChart3 from lucide-react to avoid name conflict with recharts
import { BarChart3 } from 'lucide-react';

interface Props {
  allScores: ScoreSet[];
}

const ScoreBoard: React.FC<Props> = ({ allScores }) => {
  const rankingData = useMemo(() => {
    return CONTESTANTS.map(c => {
      const contestantScores = allScores.filter(s => s.contestantId === c.id);
      
      // Calculate total for each judge
      const judgeNames = Array.from(new Set(contestantScores.map(s => s.judgeName)));
      const totalScore = judgeNames.reduce((sum: number, judge) => {
        const judgeTotal = contestantScores
          .filter(s => s.judgeName === judge)
          .reduce((jSum: number, s) => {
            // Fix: Cast Object.values to number[] and provide explicit reduce types
            const criteriaValues = Object.values(s.criteriaScores) as number[];
            const scoreSum = criteriaValues.reduce((cSum: number, val: number) => cSum + val, 0);
            return jSum + scoreSum;
          }, 0);
        return sum + judgeTotal;
      }, 0);

      const roundBreakdowns = ROUNDS.map(r => {
        const roundScores = contestantScores.filter(s => s.roundId === r.id);
        const avg = roundScores.length > 0 
          ? roundScores.reduce((acc: number, s) => {
              // Fix: Cast Object.values to number[] and provide explicit reduce types
              const criteriaValues = Object.values(s.criteriaScores) as number[];
              const scoreSum = criteriaValues.reduce((cs: number, v: number) => cs + v, 0);
              return acc + scoreSum;
            }, 0) / roundScores.length
          : 0;
        return { roundTitle: r.title, score: avg };
      });

      return {
        ...c,
        totalScore,
        judgeCount: judgeNames.length,
        averageScore: judgeNames.length > 0 ? totalScore / judgeNames.length : 0,
        roundBreakdowns
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [allScores]);

  if (allScores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="p-6 bg-gray-100 rounded-full text-gray-300">
          {/* Fix: Use BarChart3 from lucide-react instead of BarChart from recharts for the icon */}
          <BarChart3 size={64} />
        </div>
        <h3 className="text-xl font-bold text-gray-400">暂无评分数据</h3>
        <p className="text-gray-500 max-w-[200px]">评委开始评分后，这里将显示实时排名</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Top Chart */}
      <div className="glass-card p-6 rounded-[2.5rem] h-64 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rankingData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{fill: 'transparent'}} 
              contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
            />
            <Bar dataKey="totalScore" radius={[10, 10, 0, 0]}>
              {rankingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#000' : '#d1d5db'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* List */}
      <div className="space-y-4">
        {rankingData.map((c, idx) => (
          <div key={c.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                  idx === 0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{c.name}</h4>
                  <p className="text-xs text-gray-400 uppercase tracking-tighter">来自 {c.judgeCount} 位评委的评分</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">{c.totalScore.toFixed(1)}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">总分累计</div>
              </div>
            </div>

            {/* Rounds Breakdown */}
            <div className="grid grid-cols-3 gap-2">
              {c.roundBreakdowns.map((rb, rIdx) => (
                <div key={rIdx} className="bg-gray-50 p-3 rounded-2xl">
                  <p className="text-[8px] font-bold text-gray-400 truncate uppercase">{rb.roundTitle.split('：')[0]}</p>
                  <p className="text-lg font-black text-black">{rb.score.toFixed(1)}</p>
                </div>
              ))}
            </div>

            {/* Detailed Average Bar */}
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-black transition-all duration-1000 ease-out"
                style={{ width: `${(c.averageScore / 35) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
              <span>平均得分率</span>
              <span>{(c.averageScore).toFixed(1)} / 轮</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBoard;
