
import React, { useState, useEffect, useMemo } from 'react';
import { ExamSession, BoardConfig, ViewMode } from './types';
import Clock from './components/Clock';
import ExamTable from './components/ExamTable';
import AdminPanel from './components/AdminPanel';
import CountdownTimer from './components/CountdownTimer';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('signage');
  const [config, setConfig] = useState<BoardConfig>({
    title: '113學年度 第一學期 期末考試',
    date: new Date().toISOString().split('T')[0],
    venue: '教學大樓 總體考場',
    backgroundImageUrl: '',
    targetClass: '',
    showAttendance: true,
    examRules: [
      '請攜帶准考證或國民身分證。',
      '手機及電子設備請關機。',
      '考試開始 20 分鐘後不得入場。'
    ]
  });

  const [sessions, setSessions] = useState<ExamSession[]>([
    { id: '1', subject: '國文 (一)', startTime: '08:10', endTime: '09:00', room: '101', class: '101, 102', invigilator: '林大明', expectedCount: 45, presentCount: 45, absentCount: 0 },
    { id: '2', subject: '數學 (甲)', startTime: '09:10', endTime: '10:10', room: '101', class: '101, 102', invigilator: '張小華', expectedCount: 45, presentCount: 45, absentCount: 0 },
    { id: '3', subject: '物理', startTime: '10:30', endTime: '11:30', room: '101', class: '101, 102', invigilator: '王老師', expectedCount: 45, presentCount: 0, absentCount: 45 },
    { id: '4', subject: '英語聽力', startTime: '13:00', endTime: '14:00', room: '202', class: '201, 202', invigilator: '陳英', expectedCount: 40, presentCount: 0, absentCount: 40 },
  ]);

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredSessions = useMemo(() => {
    if (!config.targetClass) return sessions;
    const filter = config.targetClass.trim().toLowerCase();
    return sessions.filter(s => s.class.toLowerCase().includes(filter));
  }, [sessions, config.targetClass]);

  const ongoingExam = filteredSessions.find(s => currentTime >= s.startTime && currentTime < s.endTime);
  // 永遠顯示統計區塊：優先使用活動中考科，否則使用下一個即將開始的考科，或使用第一個考科
  const activeFocusSession = ongoingExam || filteredSessions.find(s => currentTime < s.endTime) || filteredSessions[0] || null;

  const updateAttendance = (sessionId: string, type: 'present' | 'expected', delta: number) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const updated = { ...s };
        if (type === 'present') {
          updated.presentCount = Math.max(0, (s.presentCount ?? 0) + delta);
        } else if (type === 'expected') {
          updated.expectedCount = Math.max(0, (s.expectedCount ?? 0) + delta);
        }
        updated.absentCount = Math.max(0, (updated.expectedCount || 0) - (updated.presentCount || 0));
        return updated;
      }
      return s;
    }));
  };

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // 清理背景圖 URL（移除前後空格）
  const cleanedBackgroundUrl = config.backgroundImageUrl?.trim() || '';

  useEffect(() => {
    if (cleanedBackgroundUrl) {
      setImageError(false);
      setImageLoading(true);
      let isCancelled = false;
      let loadingCompleted = false;
      let attempts = 0;
      const maxAttempts = 2;
      
      // 預載入圖片以檢查是否可載入
      const tryLoadImage = (useCors: boolean = false) => {
        if (isCancelled || loadingCompleted) return;
        
        attempts++;
        const img = new Image();
        if (useCors) {
          img.crossOrigin = 'anonymous';
        }
        
        img.onload = () => {
          if (!isCancelled && !loadingCompleted) {
            loadingCompleted = true;
            setImageError(false);
            setImageLoading(false);
          }
        };
        
        img.onerror = (error) => {
          if (!isCancelled && !loadingCompleted) {
            // 如果第一次嘗試失敗且未使用 CORS，嘗試使用 CORS
            if (!useCors && attempts < maxAttempts) {
              setTimeout(() => tryLoadImage(true), 100);
            } else {
              loadingCompleted = true;
              console.error('背景圖片載入失敗:', cleanedBackgroundUrl, error);
              setImageError(true);
              setImageLoading(false);
            }
          }
        };
        
        img.src = cleanedBackgroundUrl;
      };
      
      tryLoadImage(false);
      
      // 設置超時，如果圖片載入時間過長，也視為錯誤
      const timeout = setTimeout(() => {
        if (!isCancelled && !loadingCompleted) {
          loadingCompleted = true;
          console.warn('背景圖片載入超時:', cleanedBackgroundUrl);
          setImageError(true);
          setImageLoading(false);
        }
      }, 15000); // 15秒超時

      return () => {
        isCancelled = true;
        clearTimeout(timeout);
      };
    } else {
      setImageError(false);
      setImageLoading(false);
    }
  }, [cleanedBackgroundUrl]);

  const backgroundStyle: React.CSSProperties = cleanedBackgroundUrl && !imageError ? {
    backgroundImage: `url("${cleanedBackgroundUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'scroll',
  } : {
    backgroundColor: '#0f172a'
  };

  return (
    <div className="min-h-screen flex flex-col relative transition-all duration-1000 ease-in-out font-['Noto Sans TC']" style={backgroundStyle}>
      {/* 背景圖片載入錯誤提示 */}
      {cleanedBackgroundUrl && imageError && (
        <div className="fixed top-20 right-4 z-50 bg-red-600/90 backdrop-blur-md text-white p-5 rounded-xl shadow-2xl border border-red-500/50 max-w-md animate-fade-in">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-200 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-bold text-sm mb-2">背景圖片載入失敗</p>
              <p className="text-xs text-red-100 leading-relaxed mb-3">
                無法載入背景圖片，已切換為預設背景。
              </p>
              <div className="bg-red-700/30 rounded-lg p-3 mb-3">
                <p className="text-xs font-bold text-red-200 mb-2">建議解決方案：</p>
                <ul className="text-xs text-red-100 space-y-1.5 list-disc list-inside">
                  <li>確認圖片網址完整且正確（需包含 http:// 或 https://）</li>
                  <li>使用支援公開存取的圖片服務（如 Unsplash, Pexels）</li>
                  <li>如果使用自架圖片，請確保允許跨域存取（CORS）</li>
                  <li>可嘗試使用圖片代理服務</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setConfig({ ...config, backgroundImageUrl: '' });
                    setImageError(false);
                  }}
                  className="flex-1 px-3 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  清除背景圖
                </button>
                <button
                  onClick={() => {
                    // 強制重新載入圖片
                    setImageError(false);
                    setImageLoading(true);
                    // 觸發 useEffect 重新執行
                    const currentUrl = config.backgroundImageUrl;
                    setConfig({ ...config, backgroundImageUrl: '' });
                    setTimeout(() => {
                      setConfig({ ...config, backgroundImageUrl: currentUrl || '' });
                    }, 100);
                  }}
                  className="flex-1 px-3 py-2 bg-red-700/50 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors border border-red-500/50"
                >
                  重新載入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`absolute inset-0 z-0 transition-all duration-1000 bg-transparent`}></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col flex-1">
          <header className="px-10 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 bg-transparent flex-shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">{config.title}</h1>
                {config.targetClass && <span className="bg-amber-500 text-black px-3 py-1 rounded-md text-xs font-black uppercase shadow-lg">{config.targetClass} 專屬</span>}
              </div>
              <p className="text-blue-400 font-bold text-lg mt-1 drop-shadow-md">{config.venue}</p>
            </div>
          </div>
          <Clock />
          </header>

          <main className="flex-1 px-10 py-6">
          {viewMode === 'signage' ? (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 max-w-[1900px] mx-auto">
              <div className="lg:col-span-6 space-y-6">
                {ongoingExam && (
                  <div className="bg-transparent border-2 border-red-500/20 backdrop-blur-sm p-6 rounded-[40px] flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-block px-4 py-1 bg-red-600 text-white text-[11px] font-black rounded-lg animate-pulse uppercase tracking-widest">進行中考試 NOW</span>
                      </div>
                      <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">{ongoingExam.subject}</h2>
                      <p className="text-lg text-red-100 font-bold">考場: {ongoingExam.room} | 班級: {ongoingExam.class}</p>
                    </div>
                    <div className="relative z-10 text-right">
                      <p className="text-red-300 text-sm font-black uppercase tracking-widest mb-2">剩餘時間</p>
                      <CountdownTimer endTime={ongoingExam.endTime} className="text-6xl font-black text-white drop-shadow-2xl tabular-nums tracking-tighter" />
                    </div>
                  </div>
                )}
                <ExamTable sessions={filteredSessions} currentTime={currentTime} />
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-transparent backdrop-blur-sm p-5 rounded-[24px] border border-white/5 shadow-2xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">應考人數統計</h3>
                    {!config.showAttendance && <span className="px-2 py-1 bg-slate-800 text-slate-500 rounded text-[9px] font-bold tracking-widest">HIDDEN</span>}
                    <span className="text-[9px] font-bold text-slate-500 tracking-[0.2em] uppercase">TOUCH TO EDIT</span>
                  </div>

                  {activeFocusSession ? (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-lg font-black text-blue-400 tracking-widest uppercase">應到人數 (EXPECTED)</span>
                          <span className="text-white text-3xl font-black tabular-nums">
                            {config.showAttendance ? (activeFocusSession.expectedCount ?? 0) : ''}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateAttendance(activeFocusSession.id, 'expected', -1)} className="flex-1 py-2 bg-[#1f2937] hover:bg-slate-700 text-white rounded-xl font-black text-xl transition-all active:scale-95 border border-white/5 shadow-lg">-</button>
                          <button onClick={() => updateAttendance(activeFocusSession.id, 'expected', 1)} className="flex-1 py-2 bg-[#1f2937] hover:bg-slate-700 text-white rounded-xl font-black text-xl transition-all active:scale-95 border border-white/5 shadow-lg">+</button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-lg font-black text-blue-400 tracking-widest uppercase">實到人數 (PRESENT)</span>
                          <span className="text-white text-3xl font-black tabular-nums">
                            {config.showAttendance ? (activeFocusSession.presentCount ?? 0) : ''}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateAttendance(activeFocusSession.id, 'present', -1)} className="flex-1 py-2 bg-[#1f2937] hover:bg-slate-700 text-white rounded-xl font-black text-xl transition-all active:scale-95 border border-white/5 shadow-lg">-</button>
                          <button onClick={() => updateAttendance(activeFocusSession.id, 'present', 1)} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xl transition-all active:scale-95 shadow-xl shadow-blue-600/40 border border-white/10">+</button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <p className="text-lg font-black text-blue-400 uppercase tracking-widest mb-2">缺席人數 (ABSENT)</p>
                        <div className="flex items-center justify-between">
                          <p className={`text-3xl font-black tabular-nums transition-colors duration-500 ${config.showAttendance && (activeFocusSession.absentCount || 0) > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                            {config.showAttendance ? (activeFocusSession.absentCount ?? 0) : ''}
                          </p>
                          {config.showAttendance && (activeFocusSession.absentCount || 0) > 0 && (
                            <div className="bg-red-500/10 p-4 rounded-full animate-pulse border border-red-500/20">
                              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-700 font-black uppercase tracking-[0.3em] text-xs border-2 border-dashed border-white/5 rounded-2xl">
                      目前無活動中之考科
                    </div>
                  )}
                </div>

                <div className="bg-transparent backdrop-blur-sm p-6 rounded-[32px] border border-white/5 shadow-xl">
                  <h3 className="text-lg font-black text-slate-200 mb-5 uppercase tracking-widest border-b border-white/5 pb-3">考場規範</h3>
                  {config.examRules && config.examRules.length > 0 ? (
                    <ul className="space-y-3 text-slate-300 font-bold text-base leading-relaxed">
                      {config.examRules.map((rule, index) => (
                        <li key={index} className="flex gap-5">
                          <span className="text-blue-500 font-black text-xl">{String(index + 1).padStart(2, '0')}</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8 text-slate-600 font-bold italic">
                      目前無考場規範
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <AdminPanel config={config} setConfig={setConfig} sessions={sessions} setSessions={setSessions} />
          )}
          </main>

          <footer className="p-4 bg-transparent backdrop-blur-sm border-t border-white/5 flex justify-center gap-6 flex-shrink-0">
          <button onClick={() => setViewMode('signage')} className={`px-12 py-4 rounded-full font-black text-sm transition-all flex items-center gap-3 tracking-[0.2em] uppercase ${viewMode === 'signage' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            白板展示模式
          </button>
          <button onClick={() => setViewMode('admin')} className={`px-12 py-4 rounded-full font-black text-sm transition-all flex items-center gap-3 tracking-[0.2em] uppercase ${viewMode === 'admin' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            後台編輯模式
          </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;
