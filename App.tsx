
import React, { useState, useEffect, useCallback } from 'react';
import { CONTESTANTS, ROUNDS, MAIN_VISUAL } from './constants';
import { ScoreSet, Contestant, RoomData } from './types';
import ScoringPanel from './components/ScoringPanel';
import ScoreBoard from './components/ScoreBoard';
import { Users, BarChart3, ChevronLeft, LogOut, Radio, Globe, UserCheck, ShieldAlert, Plus, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'auth' | 'room_setup' | 'home' | 'judging' | 'results'>('auth');
  const [tempName, setTempName] = useState('');
  const [judgeName, setJudgeName] = useState(() => localStorage.getItem('singer_judge_name') || '');
  const [roomId, setRoomId] = useState(() => localStorage.getItem('singer_room_id') || '');
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- 模拟云端数据读写 (跨标签页同步核心) ---
  const fetchRoomData = useCallback((id: string): RoomData | null => {
    const data = localStorage.getItem(`SINGER_ROOM_${id}`);
    return data ? JSON.parse(data) : null;
  }, []);

  const saveRoomData = useCallback((data: RoomData) => {
    localStorage.setItem(`SINGER_ROOM_${data.id}`, JSON.stringify(data));
    // 手动触发一个 storage 事件，方便在同一个标签页内也能响应（虽然 storage event 默认只触发其他标签页）
    window.dispatchEvent(new Event('storage'));
  }, []);

  // 1. 同步逻辑：监听 storage 变化，实现实时更新
  useEffect(() => {
    if (!roomId) return;

    const sync = () => {
      const data = fetchRoomData(roomId);
      if (data) setRoomData(data);
    };

    sync();
    window.addEventListener('storage', sync);
    const poller = setInterval(sync, 1000); // 轮询补偿
    return () => {
      window.removeEventListener('storage', sync);
      clearInterval(poller);
    };
  }, [roomId, fetchRoomData]);

  // 2. 身份与房间初始化校验
  useEffect(() => {
    if (judgeName && roomId) {
      const data = fetchRoomData(roomId);
      if (data) {
        // 如果房间里没有我，说明是刷新后重连，或者非法进入
        if (!data.judges.includes(judgeName)) {
           // 尝试自动重新加入
           const updated = { ...data, judges: [...data.judges, judgeName] };
           saveRoomData(updated);
        }
        setRoomData(data);
        setView('home');
      } else {
        // 房间不存在了
        setRoomId('');
        setView('room_setup');
      }
    } else if (judgeName) {
      setView('room_setup');
    }
  }, [judgeName, roomId, fetchRoomData, saveRoomData]);

  // 3. 核心操作
  const handleRegister = () => {
    if (!tempName.trim()) return;
    setJudgeName(tempName.trim());
    localStorage.setItem('singer_judge_name', tempName.trim());
    setView('room_setup');
  };

  const createRoom = () => {
    const newId = Math.floor(10000 + Math.random() * 90000).toString();
    // 检查 ID 是否真的唯一（在 localStorage 范围内）
    if (localStorage.getItem(`SINGER_ROOM_${newId}`)) {
      createRoom(); // 递归生成直到唯一
      return;
    }
    const newData: RoomData = {
      id: newId,
      judges: [judgeName],
      scores: [],
      createdAt: Date.now()
    };
    saveRoomData(newData);
    setRoomId(newId);
    localStorage.setItem('singer_room_id', newId);
    setView('home');
  };

  const joinRoom = (id: string) => {
    setError(null);
    const data = fetchRoomData(id);
    if (!data) {
      setError('房间号不存在，请检查后输入');
      return;
    }
    // 校验姓名唯一性
    if (data.judges.includes(judgeName)) {
      // 如果已存在，允许进入（认为是同一用户刷新）
      setRoomId(id);
      localStorage.setItem('singer_room_id', id);
      setView('home');
    } else {
      // 加入新评委
      const updated: RoomData = {
        ...data,
        judges: [...data.judges, judgeName]
      };
      saveRoomData(updated);
      setRoomId(id);
      localStorage.setItem('singer_room_id', id);
      setView('home');
    }
  };

  const updateScore = (newScore: ScoreSet) => {
    if (!roomData) return;
    // 过滤掉当前评委对该选手该轮次的旧分数
    const filteredScores = roomData.scores.filter(s => 
      !(s.contestantId === newScore.contestantId && 
        s.roundId === newScore.roundId && 
        s.judgeName === judgeName)
    );
    const updated: RoomData = {
      ...roomData,
      scores: [...filteredScores, { ...newScore, judgeName, updatedAt: Date.now() }]
    };
    saveRoomData(updated);
    setRoomData(updated);
  };

  const handleLogout = () => {
    if (confirm('确定要退出当前房间并更换评委身份吗？')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // --- 界面渲染 ---

  if (view === 'auth') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-white">
        <div className="w-24 h-24 bg-white rounded-[2rem] mb-12 flex items-center justify-center rotate-6 shadow-2xl">
          <Radio className="text-black" size={48} />
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter mb-4">SINGER</h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-[0.4em] mb-16">数字评委认证</p>
        <div className="w-full max-w-sm space-y-4">
          <input 
            type="text" 
            placeholder="您的评审姓名" 
            value={tempName}
            onChange={e => setTempName(e.target.value)}
            className="w-full bg-white/10 border-none rounded-3xl py-6 px-8 text-2xl font-bold text-center focus:ring-4 focus:ring-white/20 transition-all outline-none placeholder:text-white/20"
          />
          <button 
            onClick={handleRegister}
            className="w-full bg-white text-black py-6 rounded-3xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            进入系统
          </button>
        </div>
      </div>
    );
  }

  if (view === 'room_setup') {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[3.5rem] p-12 shadow-2xl space-y-12">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full mb-4">
              <UserCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{judgeName}</span>
            </div>
            <h2 className="text-4xl font-black text-black">选择赛场</h2>
            <p className="text-gray-400 text-sm font-medium">您可以创建一个新房间或加入已有房间</p>
          </div>

          <div className="grid gap-4">
            <button onClick={createRoom} className="w-full py-6 bg-black text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 hover:shadow-2xl transition-all">
              <Plus size={24} /> 创建新赛场
            </button>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <span className="relative bg-white px-4 text-gray-300 text-[10px] font-black uppercase tracking-widest mx-auto block w-max">OR</span>
            </div>
            <div className="space-y-4">
              <input 
                type="number" 
                placeholder="输入 5 位房间码" 
                className="w-full py-6 bg-gray-50 rounded-[1.5rem] text-center text-3xl font-black tracking-[0.5em] outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
                onChange={(e) => {
                  if (e.target.value.length === 5) joinRoom(e.target.value);
                }}
              />
              {error && (
                <div className="flex items-center justify-center gap-2 text-red-500 font-bold text-xs">
                  <ShieldAlert size={14} /> {error}
                </div>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => setView('auth')} className="mt-12 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-black transition-colors">
          切换评审身份
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 bg-[#f5f5f7]">
      <header className="sticky top-0 z-50 bg-white/80 apple-blur border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20">
            <Radio size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-black leading-none uppercase">Singer 2026</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">赛场 #{roomId}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">当前评审</p>
             <p className="text-sm font-black text-black">{judgeName}</p>
           </div>
           <button onClick={handleLogout} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all">
             <LogOut size={18} />
           </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 mt-8">
        {view === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* 顶部的房间状态卡片 */}
            <div className="glass-card rounded-[2.5rem] p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {roomData?.judges.slice(0, 3).map((name, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-black border-2 border-white flex items-center justify-center text-[10px] text-white font-black">
                      {name[0]}
                    </div>
                  ))}
                  {(roomData?.judges.length || 0) > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-400 font-black">
                      +{(roomData?.judges.length || 0) - 3}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">在线评审</p>
                  <p className="text-xs font-bold">{roomData?.judges.length} 位已连接</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">已产生评分</p>
                <p className="text-xs font-bold">{roomData?.scores.length} 条记录</p>
              </div>
            </div>

            <div className="space-y-4 pb-12">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] px-2">选手打分入口</h3>
              <div className="grid gap-5">
                {CONTESTANTS.map((c) => {
                  const myScores = (roomData?.scores || []).filter(s => s.contestantId === c.id && s.judgeName === judgeName);
                  const isFinished = myScores.length === 3;
                  const totalJudgesScored = new Set((roomData?.scores || []).filter(s => s.contestantId === c.id).map(s => s.judgeName)).size;
                  
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedContestant(c); setView('judging'); }}
                      className={`group relative flex items-center p-6 rounded-[3rem] transition-all active:scale-[0.98] ${
                        isFinished ? 'bg-white/40 border border-gray-100' : 'bg-white shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:shadow-black/[0.05]'
                      }`}
                    >
                      <img src={c.image} className="w-24 h-24 rounded-[2rem] object-cover shadow-2xl" alt={c.name} />
                      <div className="ml-6 text-left flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-2xl text-black italic">{c.name}</h4>
                          {totalJudgesScored > 0 && (
                            <span className="text-[8px] bg-black text-white px-1.5 py-0.5 rounded-md font-black uppercase">
                              {totalJudgesScored}位评委已投
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3">{c.title}</p>
                        <div className="flex gap-1.5">
                           {[1,2,3].map(r => {
                             const done = myScores.some(s => s.roundId === r);
                             return <div key={r} className={`h-1 rounded-full transition-all duration-500 ${done ? 'w-8 bg-black' : 'w-4 bg-gray-100'}`} />;
                           })}
                        </div>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isFinished ? 'bg-black text-white' : 'bg-gray-50 text-gray-300 group-hover:bg-black group-hover:text-white'
                      }`}>
                        {isFinished ? <UserCheck size={20} /> : <Zap size={20} />}
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
            judgeName={judgeName}
            existingScores={(roomData?.scores || []).filter(s => s.contestantId === selectedContestant.id && s.judgeName === judgeName)}
            onSave={updateScore}
            onBack={() => setView('home')}
          />
        )}

        {view === 'results' && roomData && (
          <ScoreBoard allScores={roomData.scores} totalJudges={roomData.judges.length} />
        )}
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/90 apple-blur border border-white/10 rounded-full px-8 py-4 shadow-2xl flex items-center gap-12">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 transition-all ${view === 'home' || view === 'judging' ? 'text-white scale-110' : 'text-white/40'}`}>
          <Users size={22} />
          <span className="text-[8px] font-black uppercase tracking-widest">评审</span>
        </button>
        <button onClick={() => setView('results')} className={`flex flex-col items-center gap-1 transition-all ${view === 'results' ? 'text-white scale-110' : 'text-white/40'}`}>
          <BarChart3 size={22} />
          <span className="text-[8px] font-black uppercase tracking-widest">总榜</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
