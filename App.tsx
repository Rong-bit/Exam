
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ExamSession, BoardConfig, ViewMode } from './types';
import Clock from './components/Clock';
import ExamTable from './components/ExamTable';
import AdminPanel from './components/AdminPanel';
import CountdownTimer from './components/CountdownTimer';
import { getAllClasses, loadClassData, saveClassData, addClass, deleteClass, getDefaultClassData } from './services/storageService';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('signage');
  const [currentClass, setCurrentClass] = useState<string>('');
  const [classes, setClasses] = useState<string[]>([]);
  const [showNewClassInput, setShowNewClassInput] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  
  const defaultData = getDefaultClassData();
  const [config, setConfig] = useState<BoardConfig>(defaultData.config);
  const [sessions, setSessions] = useState<ExamSession[]>(defaultData.sessions);

  const [currentTime, setCurrentTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFooter, setShowFooter] = useState(false);

  // 初始化：載入班級列表和當前班級數據
  useEffect(() => {
    const initData = () => {
      const allClasses = getAllClasses();
      setClasses(allClasses);
      
      if (allClasses.length > 0) {
        // 如果有班級，載入第一個班級
        const firstClass = allClasses[0];
        setCurrentClass(firstClass);
        loadClassDataIntoState(firstClass);
      } else {
        // 如果沒有班級，創建默認班級
        const defaultClassName = '101';
        addClass(defaultClassName);
        setClasses([defaultClassName]);
        setCurrentClass(defaultClassName);
        const defaultData = getDefaultClassData();
        saveClassData(defaultClassName, defaultData);
        setConfig(defaultData.config);
        setSessions(defaultData.sessions);
      }
      setIsLoading(false);
    };
    
    initData();
  }, []);

  // 載入指定班級的數據到狀態
  const loadClassDataIntoState = (className: string) => {
    const data = loadClassData(className);
    if (data) {
      setConfig(data.config);
      setSessions(data.sessions);
    } else {
      // 如果數據不存在，使用默認數據
      const defaultData = getDefaultClassData();
      setConfig(defaultData.config);
      setSessions(defaultData.sessions);
      saveClassData(className, defaultData);
    }
  };

  // 保存當前班級數據
  const saveCurrentClassData = () => {
    if (currentClass) {
      saveClassData(currentClass, { config, sessions });
    }
  };

  // 當config或sessions變化時自動保存（使用useRef避免無限循環）
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (!isLoading && currentClass) {
      saveCurrentClassData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, sessions, currentClass, isLoading]);

  // 切換班級
  const handleClassChange = (className: string) => {
    if (className === currentClass) return;
    setCurrentClass(className);
    loadClassDataIntoState(className);
  };

  // 添加新班級
  const handleAddClass = () => {
    const trimmedName = newClassName.trim();
    if (!trimmedName) {
      alert('請輸入班級名稱');
      return;
    }
    if (classes.includes(trimmedName)) {
      alert('該班級已存在');
      return;
    }
    if (addClass(trimmedName)) {
      setClasses(getAllClasses());
      const defaultData = getDefaultClassData();
      saveClassData(trimmedName, defaultData);
      setCurrentClass(trimmedName);
      loadClassDataIntoState(trimmedName);
      setNewClassName('');
      setShowNewClassInput(false);
    }
  };

  // 刪除當前班級
  const handleDeleteClass = () => {
    if (classes.length <= 1) {
      alert('至少需要保留一個班級');
      return;
    }
    if (!confirm(`確定要刪除班級「${currentClass}」嗎？此操作無法復原。`)) {
      return;
    }
    if (deleteClass(currentClass)) {
      const updatedClasses = getAllClasses();
      setClasses(updatedClasses);
      if (updatedClasses.length > 0) {
        const firstClass = updatedClasses[0];
        setCurrentClass(firstClass);
        loadClassDataIntoState(firstClass);
      }
    }
  };

  // 轉換 Google Drive 連結的輔助函式
  const transformGoogleDriveUrl = (url: string): string => {
    if (!url) return '';
    const driveRegex = /\/file\/d\/([^\/]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      // 使用 lh3.googleusercontent.com 繞過預覽頁面直接獲取圖片
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  };

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

  // 取得處理後的網址
  const processedUrl = transformGoogleDriveUrl(config.backgroundImageUrl?.trim() || '');

  useEffect(() => {
    if (processedUrl) {
      setImageError(false);
      setImageLoading(true);
      let isCancelled = false;
      let loadingCompleted = false;
      
      const img = new Image();
      // Google Drive 的直連圖片通常支援匿名存取，但如果發生跨域問題可嘗試開啟
      // img.crossOrigin = 'anonymous'; 
      
      img.onload = () => {
        if (!isCancelled && !loadingCompleted) {
          loadingCompleted = true;
          setImageError(false);
          setImageLoading(false);
        }
      };
      
      img.onerror = () => {
        if (!isCancelled && !loadingCompleted) {
          loadingCompleted = true;
          setImageError(true);
          setImageLoading(false);
        }
      };
      
      img.src = processedUrl;
      
      const timeout = setTimeout(() => {
        if (!isCancelled && !loadingCompleted) {
          loadingCompleted = true;
          setImageError(true);
          setImageLoading(false);
        }
      }, 10000);

      return () => {
        isCancelled = true;
        clearTimeout(timeout);
      };
    } else {
      setImageError(false);
      setImageLoading(false);
    }
  }, [processedUrl]);

  const backgroundStyle: React.CSSProperties = processedUrl && !imageError ? {
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)), url("${processedUrl}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  } : {
    backgroundColor: '#0f172a'
  };

  // 處理滑鼠移動事件，檢測是否在底部區域
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const windowHeight = window.innerHeight;
    const mouseY = e.clientY;
    const threshold = 150; // 距離底部 150px 時顯示
    
    if (windowHeight - mouseY <= threshold) {
      setShowFooter(true);
    } else {
      setShowFooter(false);
    }
  };

  return (
    <div 
      className="h-screen flex flex-col relative transition-all duration-1000 ease-in-out font-['Noto Sans TC'] overflow-hidden" 
      style={backgroundStyle}
      onMouseMove={handleMouseMove}
    >
      {processedUrl && imageError && (
        <div className="absolute top-20 right-4 z-50 bg-red-600/90 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-red-500/50 max-w-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p className="font-bold text-sm mb-1">背景載入失敗</p>
              <p className="text-xs text-red-100">請確認 Google Drive 連結權限已設定為「知道連結的人均可查看」。</p>
              <button onClick={() => setConfig({ ...config, backgroundImageUrl: '' })} className="mt-3 text-xs font-bold underline">清除網址</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        <header className="px-10 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/20 flex-shrink-0 bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">{config.title}</h1>
                {config.targetClass && <span className="bg-amber-500 text-black px-3 py-1 rounded-md text-xs font-black uppercase shadow-lg">{config.targetClass} 專屬</span>}
              </div>
              <p className="text-blue-400 font-bold text-lg mt-1 drop-shadow-lg">{config.venue}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/60 backdrop-blur-md rounded-xl p-2 border border-white/10">
              <label className="text-sm font-bold text-blue-300 uppercase tracking-wider px-2">班級</label>
              <select
                value={currentClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none min-w-[100px]"
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              {showNewClassInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddClass()}
                    placeholder="班級名稱"
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none w-24"
                    autoFocus
                  />
                  <button
                    onClick={handleAddClass}
                    className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    確認
                  </button>
                  <button
                    onClick={() => {
                      setShowNewClassInput(false);
                      setNewClassName('');
                    }}
                    className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowNewClassInput(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-1"
                    title="新增班級"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  {classes.length > 1 && (
                    <button
                      onClick={handleDeleteClass}
                      className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-sm transition-colors"
                      title="刪除當前班級"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
            <Clock />
          </div>
        </header>

        <main className="flex-1 px-10 py-6 overflow-y-auto">
          {viewMode === 'signage' ? (
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 max-w-[1900px] mx-auto">
              <div className="lg:col-span-6 space-y-6">
                {ongoingExam && (
                  <div className="p-8 rounded-[40px] bg-slate-900/60 backdrop-blur-xl border border-white/10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-block px-4 py-1 bg-red-600 text-white text-[11px] font-black rounded-lg animate-pulse uppercase tracking-widest">進行中考試 NOW</span>
                      </div>
                      <h2 className="text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">{ongoingExam.subject}</h2>
                      <p className="text-xl text-white/90 font-bold">考場: {ongoingExam.room} | 班級: {ongoingExam.class}</p>
                    </div>
                    <div className="relative z-10 text-right">
                      <p className="text-red-400 text-sm font-black uppercase tracking-widest mb-2">剩餘時間</p>
                      <CountdownTimer endTime={ongoingExam.endTime} className="text-7xl font-black text-white tabular-nums tracking-tighter" />
                    </div>
                  </div>
                )}
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
                   <ExamTable sessions={filteredSessions} currentTime={currentTime} />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="p-8 rounded-[32px] bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest">應考人數統計</h3>
                    {!config.showAttendance && <span className="px-3 py-1 bg-slate-800 text-slate-500 rounded text-[10px] font-bold tracking-widest">HIDDEN</span>}
                  </div>

                  {activeFocusSession ? (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-black text-blue-400 tracking-widest uppercase">應到人數</span>
                          <span className="text-white text-4xl font-black tabular-nums">
                            {config.showAttendance ? (activeFocusSession.expectedCount ?? 0) : '---'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateAttendance(activeFocusSession.id, 'expected', -1)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black transition-all active:scale-95 border border-white/10">-</button>
                          <button onClick={() => updateAttendance(activeFocusSession.id, 'expected', 1)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black transition-all active:scale-95 border border-white/10">+</button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-black text-blue-400 tracking-widest uppercase">實到人數</span>
                          <span className="text-white text-4xl font-black tabular-nums">
                            {config.showAttendance ? (activeFocusSession.presentCount ?? 0) : '---'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateAttendance(activeFocusSession.id, 'present', -1)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black transition-all active:scale-95 border border-white/10">-</button>
                          <button onClick={() => updateAttendance(activeFocusSession.id, 'present', 1)} className="flex-1 py-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl font-black transition-all active:scale-95 border border-blue-400/30">+</button>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10">
                        <p className="text-sm font-black text-red-400 uppercase tracking-widest mb-4">缺席人數</p>
                        <div className="flex items-center justify-between">
                          <p className={`text-5xl font-black tabular-nums transition-colors duration-500 ${config.showAttendance && (activeFocusSession.absentCount || 0) > 0 ? 'text-red-500' : 'text-white/20'}`}>
                            {config.showAttendance ? (activeFocusSession.absentCount ?? 0) : '---'}
                          </p>
                          {config.showAttendance && (activeFocusSession.absentCount || 0) > 0 && (
                            <div className="bg-red-500/20 p-4 rounded-full animate-pulse border border-red-500/30">
                              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/30 font-black uppercase tracking-widest text-xs border-2 border-dashed border-white/10 rounded-2xl">
                      目前無活動中之考科
                    </div>
                  )}
                </div>

                <div className="p-8 rounded-[32px] bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">考場規範</h3>
                  {config.examRules && config.examRules.length > 0 ? (
                    <ul className="space-y-4 text-white/90 font-bold text-lg leading-relaxed">
                      {config.examRules.map((rule, index) => (
                        <li key={index} className="flex gap-4">
                          <span className="text-blue-400 font-black">{String(index + 1).padStart(2, '0')}</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8 text-white/30 italic">目前無考場規範</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <AdminPanel 
              config={config} 
              setConfig={setConfig} 
              sessions={sessions} 
              setSessions={setSessions}
              currentClass={currentClass}
            />
          )}
        </main>

        <footer className={`fixed bottom-0 left-0 right-0 p-6 border-t border-white/10 flex justify-center gap-6 bg-slate-900/60 backdrop-blur-md transition-all duration-300 z-50 ${
          showFooter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}>
          <button onClick={() => setViewMode('signage')} className={`px-10 py-4 rounded-full font-black text-sm transition-all flex items-center gap-3 tracking-widest uppercase ${viewMode === 'signage' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            白板展示
          </button>
          <button onClick={() => setViewMode('admin')} className={`px-10 py-4 rounded-full font-black text-sm transition-all flex items-center gap-3 tracking-widest uppercase ${viewMode === 'admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            後台編輯
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;
