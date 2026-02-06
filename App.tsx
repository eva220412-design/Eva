
import React, { useState, useEffect, useCallback } from 'react';
import { CONTESTANTS, ROUNDS, MAIN_VISUAL } from './constants';
import { ScoreSet, Contestant } from './types';
import ScoringPanel from './components/ScoringPanel';
import ScoreBoard from './components/ScoreBoard';
import { Users, BarChart3, ChevronLeft, Plus, Share2, Trash2, Edit3, Wifi, SignalHigh, QrCode } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'judging' | 'results' | 'join'>('home');
  const [roomId, setRoomId] = useState(() => localStorage.getItem('singer_room_id') || '');
  const [judgeIndex, setJudgeIndex] = useState(() => parseInt(localStorage.getItem('singer_judge_idx') || '-1'));
  const [allScores, setAllScores] = useState<ScoreSet[]>([]);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);

  // Initial Sync Logic (Simulating Cloud Sync with LocalStorage + Cross-Tab for 5 judges)
  // In a real production app, this would use Supabase/Firebase Realtime
  useEffect(() => {
    const syncData = () => {
      const saved = localStorage.getItem(`singer_scores_${roomId}`);
      if (saved) {
        setAllScores(JSON.parse(saved));
      }
    };

    syncData();
    window.addEventListener('storage', syncData);
    const interval = setInterval(syncData, 3000); // Polling simulation
    return () => {
      window.removeEventListener('storage', syncData);
      clearInterval(interval);
    };
  }, [roomId]);

  const saveToSync = (scores: ScoreSet[]) => {
    setAllScores(scores);
    localStorage.setItem(`singer_scores_${roomId}`, JSON.stringify(scores));
  };

  const handleScoreUpdate = (score: ScoreSet) => {
    const updated = allScores.filter(s => 
      !(s.contestantId === score.contestantId && 
        s.roundId === score.roundId && 
        s.judgeIndex === judgeIndex)
    );
    saveToSync([...updated, { ...score, judgeIndex }]);
  };

  const joinRoom = (id: string, idx: number) => {
    setRoomId(id);
    setJudgeIndex(idx);
    localStorage.setItem('singer_room_id', id);
    localStorage.setItem('singer_judge_idx', idx.toString());
    setView('home');
  };

  const leaveRoom = () => {
    if(confirm('确定退出当前房间吗？')) {
      localStorage.removeItem('singer_room_id');
      localStorage.removeItem('singer_judge_idx');
      setRoomId('');
      setJudgeIndex(-1);
      setView('join');
    }
  };

  if (judgeIndex === -1 && view !== 'join') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">
          <Wifi className="text-white" size={40} />
        </div>
        <h2 className="text-white text-3xl font-black mb-4 tracking-tight">同步模式未激活</h2>
        <p className="text-white/60 mb-8 max-w-xs">为了满足多评委实时协作，请先加入或创建一个评分房间。</p>
        <button 
          onClick={() => setView('join')}
          className="w-full max-w-xs bg-white text-black py-5 rounded-[1.5rem] font-bold text-lg hover:scale-105 active:scale-95 transition-all"
        >
          创建/加入房间
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden bg-[#f5f5f7]">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 bg-white/80 apple-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'home' && (
            <button onClick={() => setView('home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-lg font-black tracking-tight text-black leading-none">SINGER 2026</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LIVE SYNC • Room {roomId}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right">
             <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">当前席位</p>
             <p className="text-sm font-black text-black">评委 {judgeIndex + 1}</p>
           </div>
           <button onClick={leaveRoom} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-black">
             <Trash2 size={16} />
           </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6">
        {view === 'join' && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-black mb-2">房间配置</h2>
                <p className="text-sm text-gray-400">输入 5 位数字代码以进入共享评分室</p>
              </div>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="房间 ID (如 88888)" 
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-100 rounded-2xl border-none text-xl font-bold text-center tracking-[0.5em] focus:ring-2 focus:ring-black outline-none"
                />
                <div className="grid grid-cols-5 gap-2">
                  {[0,1,2,3,4].map(idx => (
                    <button
                      key={idx}
                      onClick={() => joinRoom(roomId || '00000', idx)}
                      className={`h-14 rounded-xl font-bold transition-all border-2 ${
                        judgeIndex === idx 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-black'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider">选择您的评委席位 (1-5)</p>
              </div>
            </div>
          </div>
        )}

        {view === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Visual Billboard */}
            <div className="relative h-56 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img src={MAIN_VISUAL} className="w-full h-full object-cover" alt="Main" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                <h2 className="text-white text-4xl font-black italic tracking-tighter">THE SINGER</h2>
                <p className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase">2026 Season Finale</p>
              </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 gap-4">
               <div className="glass-card p-5 rounded-[2rem] border-l-4 border-l-black">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">同步状态</p>
                 <div className="flex items-center gap-2">
                   <SignalHigh size={14} className="text-green-500" />
                   <span className="text-lg font-black italic">已就绪</span>
                 </div>
               </div>
               <div className="glass-card p-5 rounded-[2rem]">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">参与人数</p>
                 <div className="flex items-center gap-2">
                   <Users size={14} className="text-black" />
                   <span className="text-lg font-black italic">5/5 评委</span>
                 </div>
               </div>
            </div>

            {/* Contestants */}
            <div className="space-y-4 pb-10">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">在线打分选手</h3>
              <div className="grid gap-4">
                {CONTESTANTS.map((c) => {
                  const completedRounds = new Set(allScores.filter(s => s.contestantId === c.id && s.judgeIndex === judgeIndex).map(s => s.roundId));
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedContestant(c); setView('judging'); }}
                      className="group flex items-center p-5 bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all active:scale-[0.97]"
                    >
                      <img src={c.image} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-lg" alt={c.name} />
                      <div className="ml-5 text-left flex-1">
                        <h4 className="font-black text-xl text-black">{c.name}</h4>
                        <p className="text-gray-400 text-xs font-medium">{c.title}</p>
                        <div className="flex gap-1 mt-2">
                           {[1,2,3].map(r => (
                             <div key={r} className={`w-6 h-1 rounded-full ${completedRounds.has(r) ? 'bg-black' : 'bg-gray-100'}`} />
                           ))}
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all">
                        <Plus size={20} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {view === 'judging' && selectedContestant && (
          <ScoringPanel 
            contestant={selectedContestant} 
            judgeName={`评委 ${judgeIndex + 1}`}
            judgeIndex={judgeIndex}
            existingScores={allScores.filter(s => s.contestantId === selectedContestant.id && s.judgeIndex === judgeIndex)}
            onSave={handleScoreUpdate}
            onBack={() => setView('home')}
          />
        )}

        {view === 'results' && (
          <ScoreBoard allScores={allScores} />
        )}
      </main>

      {/* Nav */}
      {view !== 'judging' && view !== 'join' && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 apple-blur border-t border-gray-100 pb-safe">
          <div className="max-w-md mx-auto flex justify-around items-center h-20">
            <button onClick={() => setView('home')} className={`flex flex-col items-center transition-all ${view === 'home' ? 'text-black scale-110' : 'text-gray-400'}`}>
              <Users size={24} className={view === 'home' ? 'fill-current' : ''} />
              <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">选手</span>
            </button>
            <button onClick={() => setView('results')} className={`flex flex-col items-center transition-all ${view === 'results' ? 'text-black scale-110' : 'text-gray-400'}`}>
              <BarChart3 size={24} className={view === 'results' ? 'fill-current' : ''} />
              <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">实时大榜</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
