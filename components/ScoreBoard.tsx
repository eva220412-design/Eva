
import React, { useMemo } from 'react';
import { CONTESTANTS, ROUNDS } from '../constants';
import { ScoreSet } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Trophy, Share2, Activity, Percent } from 'lucide-react';

interface Props {
  allScores: ScoreSet[];
  totalJudges: number;
}

const ScoreBoard: React.FC<Props> = ({ allScores, totalJudges }) => {
  const rankingData = useMemo(() => {
    return CONTESTANTS.map(c => {
      const scores = allScores.filter(s => s.contestantId === c.id);
      
      // 所有评委的所有分数加总
      const totalScore = scores.reduce((sum, s) => {
        const val = Object.values(s.criteriaScores).reduce((acc: number, v: number) => acc + v, 0);
        return sum + val;
      }, 0);

      const uniqueJudges = Array.from(new Set(scores.map(s => s.judgeName)));
      const judgeCoverage = totalJudges > 0 ? (uniqueJudges.length / totalJudges) * 100 : 0;

      const roundAggregates = ROUNDS.map(r => {
        const rScores = scores.filter(s => s.roundId === r.id);
        const rSum = rScores.reduce((sum, s) => sum + Object.values(s.criteriaScores).reduce((acc: number, v: number) => acc + v, 0), 0);
        return { 
          title: r.title, 
          avg: uniqueJudges.length > 0 ? rSum / uniqueJudges.length : 0,
          total: rSum 
        };
      });

      return {
        ...c,
        totalScore,
        judgeList: uniqueJudges,
        judgeCoverage,
        roundAggregates
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [allScores, totalJudges]);

  if (allScores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <Activity size={40} className="text-gray-300" />
        </div>
        <h3 className="text-2xl font-black text-black italic">静候首个评分</h3>
        <p className="text-gray-400 text-sm mt-3 leading-relaxed">房间内目前有 {totalJudges} 位评审在线<br/>实时同步已开启</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-1000">
      {/* 冠军视觉卡片 */}
      <div className="relative glass-card rounded-[3.5rem] p-10 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12"><Trophy size={160} /></div>
        <div className="relative z-10">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Live Ranking Leader</p>
          <div className="flex items-end gap-3 mb-8">
            <h3 className="text-5xl font-black italic tracking-tighter">{rankingData[0].name}</h3>
            <span className="text-xs font-black bg-black text-white px-3 py-1 rounded-full mb-2">TOP 1</span>
          </div>
          
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="totalScore" radius={[10, 10, 0, 0]}>
                  {rankingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#000' : '#f3f4f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 详细列表 */}
      <div className="space-y-6">
        {rankingData.map((c, idx) => (
          <div key={c.id} className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50">
            <div className="flex items-center gap-6">
              <div className="relative">
                <img src={c.image} className="w-24 h-24 rounded-[2rem] object-cover shadow-xl" alt={c.name} />
                <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center font-black italic border-4 border-white shadow-lg ${
                  idx === 0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {idx + 1}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-2xl font-black text-black italic leading-none mb-1">{c.name}</h4>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Percent size={10} />
                      <span className="text-[9px] font-black uppercase tracking-widest">评审覆盖率 {c.judgeCoverage.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black italic block leading-none">{c.totalScore.toFixed(1)}</span>
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Total Points</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {c.judgeList.length > 0 ? (
                    c.judgeList.map(name => (
                      <span key={name} className="text-[8px] font-black bg-gray-50 text-gray-400 px-2 py-1 rounded-md border border-gray-100">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[8px] font-black text-gray-200">NO SCORES YET</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50">
               {c.roundAggregates.map((ra, ridx) => (
                 <div key={ridx} className="text-center group">
                    <p className="text-[8px] font-black text-gray-300 uppercase mb-2 truncate px-1 group-hover:text-black transition-colors">{ra.title.split('：')[0]}</p>
                    <p className="text-lg font-black text-black leading-none">{ra.total.toFixed(1)}</p>
                    <p className="text-[9px] font-bold text-gray-400 mt-2 bg-gray-50 inline-block px-2 py-0.5 rounded-full">AVG {ra.avg.toFixed(1)}</p>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>

      <button 
        className="w-full py-7 bg-black text-white rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl shadow-black/20"
        onClick={() => {
          const summary = rankingData.map((c, i) => `${i+1}位. ${c.name}: ${c.totalScore.toFixed(1)}`).join('\n');
          const shareText = `🎤 SINGER 2026 实时战报\n赛场: #${localStorage.getItem('singer_room_id')}\n评审数: ${totalJudges}\n\n${summary}`;
          if (navigator.share) {
            navigator.share({ title: '赛场排行榜', text: shareText });
          } else {
            navigator.clipboard.writeText(shareText);
            alert('战报已复制到剪贴板！');
          }
        }}
      >
        <Share2 size={24} /> 分享全场战报
      </button>
    </div>
  );
};

export default ScoreBoard;
