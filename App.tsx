
import React, { useState, useEffect } from 'react';
import { CONTESTANTS, ROUNDS, MAIN_VISUAL } from './constants';
import { ScoreSet, Contestant } from './types';
import ScoringPanel from './components/ScoringPanel';
import ScoreBoard from './components/ScoreBoard';
import { Users, BarChart3, ChevronLeft, Plus, Share2, Trash2, Edit3, X, UserPlus } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'judging' | 'results' | 'manage_judges'>('home');
  const [judges, setJudges] = useState<string[]>(() => {
    const saved = localStorage.getItem('singer_2026_judges');
    return saved ? JSON.parse(saved) : ['评委 A', '评委 B'];
  });
  const [currentJudge, setCurrentJudge] = useState<string>(judges[0] || '');
  const [allScores, setAllScores] = useState<ScoreSet[]>(() => {
    const saved = localStorage.getItem('singer_2026_scores');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [newJudgeName, setNewJudgeName] = useState('');

  useEffect(() => {
    localStorage.setItem('singer_2026_scores', JSON.stringify(allScores));
  }, [allScores]);

  useEffect(() => {
    localStorage.setItem('singer_2026_judges', JSON.stringify(judges));
  }, [judges]);

  const handleScoreUpdate = (score: ScoreSet) => {
    setAllScores(prev => {
      const filtered = prev.filter(s => 
        !(s.contestantId === score.contestantId && 
          s.roundId === score.roundId && 
          s.judgeName === score.judgeName)
      );
      return [...filtered, score];
    });
  };

  const handleReset = () => {
    if (confirm('确定要清空所有评分数据吗？')) {
      setAllScores([]);
      localStorage.removeItem('singer_2026_scores');
    }
  };

  const addJudge = () => {
    if (!newJudgeName.trim()) return;
    if (judges.includes(newJudgeName.trim())) {
      alert('评委名称已存在');
      return;
    }
    setJudges([...judges, newJudgeName.trim()]);
    setNewJudgeName('');
  };

  const removeJudge = (name: string) => {
    if (confirm(`确定要移除评委 "${name}" 吗？其评分数据将保留但不再显示在选择列表中。`)) {
      setJudges(judges.filter(j => j !== name));
      if (currentJudge === name) setCurrentJudge(judges.find(j => j !== name) || '');
    }
  };

  const shareResults = () => {
    const topPerformer = [...CONTESTANTS].map(c => {
      const scores = allScores.filter(s => s.contestantId === c.id);
      const total = scores.reduce((sum, s) => sum + Object.values(s.criteriaScores).reduce((cs: any, v: any) => cs + v, 0), 0);
      return { name: c.name, total };
    }).sort((a, b) => b.total - a.total)[0];

    const text = `🎤 Singer 2026 战报：目前领先的是 ${topPerformer?.name || '...'}！快来查看完整排名。`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Singer 2026 评分报告',
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert(text + '\n\n链接：' + window.location.href);
    }
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 apple-blur border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'home' && (
            <button onClick={() => setView('home')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight text-black">
            {view === 'results' ? '最终排名' : view === 'manage_judges' ? '评委管理' : 'Singer 2026'}
          </h1>
        </div>
        <div className="flex gap-2">
          {view === 'results' && (
            <button onClick={shareResults} className="p-2 bg-black text-white rounded-full">
              <Share2 size={18} />
            </button>
          )}
          {view === 'home' && (
            <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-500 transition-colors uppercase font-medium">
              重置
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 mt-6">
        {view === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Visual Header */}
            <div className="relative h-48 rounded-3xl overflow-hidden shadow-2xl group">
              <img src={MAIN_VISUAL} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main Visual" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                <span className="text-white/60 text-xs font-bold tracking-widest uppercase mb-1">Singer 2026</span>
                <h2 className="text-white text-3xl font-black">歌王之战</h2>
              </div>
            </div>

            {/* Judge Selector */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">当前评委</h3>
                <button onClick={() => setView('manage_judges')} className="text-xs font-bold text-black flex items-center gap-1">
                  <Edit3 size={14} /> 管理
                </button>
              </div>
              <div className="glass-card p-6 rounded-[2rem] space-y-4">
                <select 
                  value={currentJudge}
                  onChange={(e) => setCurrentJudge(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-100/50 rounded-2xl border-none focus:ring-2 focus:ring-black outline-none transition-all text-lg font-medium appearance-none"
                >
                  {judges.length === 0 && <option value="">请先添加评委</option>}
                  {judges.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>

            {/* Contestant List */}
            <div className="space-y-4 pb-10">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">选手名单</h3>
              <div className="grid gap-4">
                {CONTESTANTS.map((contestant) => (
                  <button
                    key={contestant.id}
                    disabled={!currentJudge}
                    onClick={() => {
                      setSelectedContestant(contestant);
                      setView('judging');
                    }}
                    className={`group relative flex items-center p-4 rounded-3xl transition-all border-2 ${
                      currentJudge 
                      ? 'bg-white border-transparent shadow-sm hover:shadow-xl hover:border-black/10 active:scale-[0.98]' 
                      : 'bg-gray-100 border-dashed border-gray-300 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                      <img src={contestant.image} alt={contestant.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-4 text-left flex-1">
                      <h4 className="font-bold text-lg text-black">{contestant.name}</h4>
                      <p className="text-gray-500 text-sm">{contestant.title}</p>
                    </div>
                    <div className="bg-black/5 p-2 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
                      <Plus size={20} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'manage_judges' && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="glass-card p-6 rounded-[2.5rem] space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-500 uppercase px-2">新增评委</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newJudgeName}
                    onChange={(e) => setNewJudgeName(e.target.value)}
                    placeholder="输入姓名..."
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-black outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addJudge()}
                  />
                  <button onClick={addJudge} className="p-3 bg-black text-white rounded-xl">
                    <UserPlus size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-500 uppercase px-2">评委列表</label>
                <div className="space-y-2">
                  {judges.map(judge => (
                    <div key={judge} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <span className="font-medium text-lg">{judge}</span>
                      <button onClick={() => removeJudge(judge)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {judges.length === 0 && <p className="text-center text-gray-400 py-4 italic">暂无评委数据</p>}
                </div>
              </div>
            </div>
            <button onClick={() => setView('home')} className="w-full py-4 text-black font-bold text-lg">完成设置</button>
          </div>
        )}

        {view === 'judging' && selectedContestant && (
          <ScoringPanel 
            contestant={selectedContestant} 
            judgeName={currentJudge}
            existingScores={allScores.filter(s => s.contestantId === selectedContestant.id && s.judgeName === currentJudge)}
            onSave={handleScoreUpdate}
            onBack={() => setView('home')}
          />
        )}

        {view === 'results' && (
          <ScoreBoard 
            allScores={allScores} 
          />
        )}
      </main>

      {/* Navigation Bar */}
      {view !== 'judging' && view !== 'manage_judges' && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 apple-blur border-t border-gray-200 pb-safe">
          <div className="max-w-md mx-auto flex justify-around items-center h-20">
            <button onClick={() => setView('home')} className={`flex flex-col items-center transition-all ${view === 'home' ? 'text-black scale-110' : 'text-gray-400'}`}>
              <Users size={22} className={view === 'home' ? 'fill-current' : ''} />
              <span className="text-[10px] font-bold mt-1">选手</span>
            </button>
            <button onClick={() => setView('results')} className={`flex flex-col items-center transition-all ${view === 'results' ? 'text-black scale-110' : 'text-gray-400'}`}>
              <BarChart3 size={22} className={view === 'results' ? 'fill-current' : ''} />
              <span className="text-[10px] font-bold mt-1">排行榜</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
