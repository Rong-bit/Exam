
import React, { useState } from 'react';
import { ExamSession, BoardConfig } from '../types';
import { exportClassData, importClassData } from '../services/storageService';

interface AdminPanelProps {
  config: BoardConfig;
  setConfig: (config: BoardConfig) => void;
  sessions: ExamSession[];
  setSessions: (sessions: ExamSession[]) => void;
  currentClass: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ config, setConfig, sessions, setSessions, currentClass }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [newSession, setNewSession] = useState<Partial<ExamSession>>({
    subject: '',
    startTime: '',
    endTime: '',
    room: '',
    class: '',
    invigilator: '',
    expectedCount: 0,
    presentCount: 0,
    absentCount: 0
  });
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [newRule, setNewRule] = useState('');

  // 導出數據
  const handleExport = () => {
    const data = exportClassData(currentClass);
    if (!data) {
      alert('導出失敗，數據為空');
      return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam_data_${currentClass}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 導入數據
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;
          if (importClassData(currentClass, jsonData)) {
            // 重新載入數據
            window.location.reload();
          } else {
            alert('導入失敗，請檢查JSON格式是否正確');
          }
        } catch (error) {
          alert('導入失敗：' + error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 轉換 Google Drive 連結的輔助函式
  const transformGoogleDriveUrl = (url: string): string => {
    if (!url) return '';
    const driveRegex = /\/file\/d\/([^\/]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  };

  const displayUrl = transformGoogleDriveUrl(config.backgroundImageUrl || '');

  const handleAddSession = () => {
    if (!newSession.subject || !newSession.startTime || !newSession.endTime) {
      alert('請填寫完整必填資訊 (科目、開始與結束時間)');
      return;
    }
    
    if (editingId) {
      const existingSession = sessions.find(s => s.id === editingId);
      const session: ExamSession = {
        id: editingId,
        subject: newSession.subject || '',
        startTime: newSession.startTime || '',
        endTime: newSession.endTime || '',
        room: newSession.room || '',
        class: newSession.class || '',
        invigilator: newSession.invigilator || '',
        expectedCount: existingSession?.expectedCount ?? 0,
        presentCount: existingSession?.presentCount ?? 0,
        absentCount: existingSession?.absentCount ?? 0
      };
      setSessions(sessions.map(s => s.id === editingId ? session : s));
      setEditingId(null);
    } else {
      const session: ExamSession = {
        id: Math.random().toString(36).substr(2, 9),
        subject: newSession.subject || '',
        startTime: newSession.startTime || '',
        endTime: newSession.endTime || '',
        room: newSession.room || '',
        class: newSession.class || '',
        invigilator: newSession.invigilator || '',
        expectedCount: Number(newSession.expectedCount) || 0,
        presentCount: Number(newSession.presentCount) || 0,
        absentCount: Math.max(0, (Number(newSession.expectedCount) || 0) - (Number(newSession.presentCount) || 0))
      };
      setSessions([...sessions, session]);
    }
    
    setNewSession({ subject: '', startTime: '', endTime: '', room: '', class: '', invigilator: '', expectedCount: 0, presentCount: 0, absentCount: 0 });
  };

  const handleEditSession = (session: ExamSession) => {
    setEditingId(session.id);
    setNewSession({
      subject: session.subject,
      startTime: session.startTime,
      endTime: session.endTime,
      room: session.room,
      class: session.class,
      invigilator: session.invigilator || '',
      expectedCount: session.expectedCount || 0,
      presentCount: session.presentCount || 0,
      absentCount: session.absentCount || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewSession({ subject: '', startTime: '', endTime: '', room: '', class: '', invigilator: '', expectedCount: 0, presentCount: 0, absentCount: 0 });
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handleAddRule = () => {
    if (!newRule.trim()) {
      alert('請輸入考場規範內容');
      return;
    }
    const currentRules = config.examRules || [];
    if (editingRuleIndex !== null) {
      const updatedRules = [...currentRules];
      updatedRules[editingRuleIndex] = newRule.trim();
      setConfig({ ...config, examRules: updatedRules });
      setEditingRuleIndex(null);
    } else {
      setConfig({ ...config, examRules: [...currentRules, newRule.trim()] });
    }
    setNewRule('');
  };

  const handleEditRule = (index: number) => {
    const currentRules = config.examRules || [];
    setNewRule(currentRules[index]);
    setEditingRuleIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditRule = () => {
    setEditingRuleIndex(null);
    setNewRule('');
  };

  const handleDeleteRule = (index: number) => {
    const currentRules = config.examRules || [];
    const updatedRules = currentRules.filter((_, i) => i !== index);
    setConfig({ ...config, examRules: updatedRules });
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    const currentRules = config.examRules || [];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentRules.length - 1) return;
    
    const updatedRules = [...currentRules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedRules[index], updatedRules[targetIndex]] = [updatedRules[targetIndex], updatedRules[index]];
    setConfig({ ...config, examRules: updatedRules });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-10 bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700 text-white shadow-2xl mb-20">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-black border-b border-slate-700 pb-4 flex items-center gap-3 flex-1">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            看板設定與顯示控制
          </h2>
          <div className="flex gap-2 ml-4">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
              title="導出當前班級數據"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              導出數據
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
              title="導入數據（會覆蓋當前數據）"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              導入數據
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">考試標題</label>
            <input
              type="text"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">場地/校區</label>
            <input
              type="text"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={config.venue}
              onChange={(e) => setConfig({ ...config, venue: e.target.value })}
            />
          </div>

          <div className="md:col-span-1 p-6 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-between">
            <div>
              <label className="block text-sm font-black text-blue-300 uppercase tracking-widest">顯示人數統計</label>
              <p className="text-xs text-slate-500 mt-1 italic">關閉後白板將隱藏人數數字</p>
            </div>
            <button 
              onClick={() => setConfig({ ...config, showAttendance: !config.showAttendance })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${config.showAttendance ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${config.showAttendance ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="md:col-span-1 p-6 bg-blue-900/20 border border-blue-500/30 rounded-2xl">
            <label className="block text-sm font-black text-blue-300 mb-2 uppercase tracking-widest">篩選特定班級</label>
            <input
              type="text"
              placeholder="例如：101"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-slate-600"
              value={config.targetClass || ''}
              onChange={(e) => setConfig({ ...config, targetClass: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 p-6 bg-purple-900/20 border border-purple-500/30 rounded-2xl">
            <label className="block text-sm font-black text-purple-300 mb-2 uppercase tracking-widest">背景圖連結 (支援 Google Drive)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                placeholder="輸入圖片網址或雲端硬碟分享連結"
                className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-400 outline-none placeholder:text-slate-600"
                value={config.backgroundImageUrl || ''}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setConfig({ ...config, backgroundImageUrl: value });
                  if (value) {
                    setImageLoadError(false);
                    setImageLoading(true);
                  } else {
                    setImageLoadError(false);
                    setImageLoading(false);
                  }
                }}
              />
              <button
                onClick={() => {
                  const testImage = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=2000';
                  setConfig({ ...config, backgroundImageUrl: testImage });
                  setImageLoadError(false);
                  setImageLoading(true);
                }}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap"
              >
                測試圖片
              </button>
            </div>
            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs font-bold text-purple-300 mb-2">支援連結格式：</p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• 直接圖片網址 (JPG, PNG)</li>
                <li>• Google Drive 分享連結 (需設為「知道連結的人均可查看」)</li>
                <li>• 系統會自動轉換為圖片直連格式</li>
              </ul>
            </div>
            {config.backgroundImageUrl && (
              <div className="mt-3 space-y-2">
                <div className="p-2 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-green-400 mb-1">實際載入網址：</p>
                  <p className="text-xs text-slate-400 break-all">{displayUrl}</p>
                </div>
                <div className="relative w-full h-32 bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
                  {imageLoading && !imageLoadError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800/90 text-blue-400 text-xs">
                      載入中...
                    </div>
                  )}
                  {imageLoadError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/90 text-red-400 text-xs p-4 text-center space-y-2">
                      <p className="font-bold text-red-500">無法載入圖片</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        請確保雲端連結權限已開啟<br />
                        或圖片網址正確無誤
                      </p>
                    </div>
                  ) : (
                    <img
                      src={displayUrl}
                      alt="背景預覽"
                      className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                      onError={() => {
                        setImageLoadError(true);
                        setImageLoading(false);
                      }}
                      onLoad={() => {
                        setImageLoadError(false);
                        setImageLoading(false);
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black mb-6 border-b border-slate-700 pb-3 flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          考場規範管理
          {editingRuleIndex !== null && (
            <span className="ml-3 text-sm text-blue-400 font-normal">(編輯中)</span>
          )}
        </h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="請輸入考場規範內容..."
              className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddRule();
                }
              }}
            />
            <button
              onClick={handleAddRule}
              className={`px-6 py-3 ${editingRuleIndex !== null ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'} text-white font-black rounded-xl transition-all shadow-lg active:scale-95`}
            >
              {editingRuleIndex !== null ? '確認修改' : '新增規範'}
            </button>
            {editingRuleIndex !== null && (
              <button
                onClick={handleCancelEditRule}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-black rounded-xl transition-all shadow-lg active:scale-95"
              >
                取消
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {(config.examRules || []).map((rule, index) => (
              <div key={index} className={`flex items-center gap-3 bg-slate-800/50 p-4 rounded-xl group border ${editingRuleIndex === index ? 'border-blue-500' : 'border-white/5'}`}>
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-blue-500 font-black text-lg min-w-[2rem]">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-white font-bold flex-1">{rule}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleMoveRule(index, 'up')}
                    disabled={index === 0}
                    className="text-slate-400 hover:text-blue-400 px-2 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveRule(index, 'down')}
                    disabled={index === (config.examRules || []).length - 1}
                    className="text-slate-400 hover:text-blue-400 px-2 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button onClick={() => handleEditRule(index)} className="text-blue-400 hover:text-blue-300 px-3 py-1 rounded transition-colors">編輯</button>
                  <button onClick={() => handleDeleteRule(index)} className="text-red-400 hover:text-red-300 px-3 py-1 rounded transition-colors">刪除</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black mb-6 border-b border-slate-700 pb-3">
          {editingId ? '編輯考試科目' : '新增考試科目'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">科目名稱</label>
            <input
              placeholder="科目名稱"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500"
              value={newSession.subject}
              onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">開始時間</label>
            <input
              type="time"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={newSession.startTime}
              onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">結束時間</label>
            <input
              type="time"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={newSession.endTime}
              onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">班級</label>
            <input
              placeholder="如: 101, 102"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500"
              value={newSession.class}
              onChange={(e) => setNewSession({ ...newSession, class: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">監考老師</label>
            <input
              placeholder="監考老師"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-500"
              value={newSession.invigilator}
              onChange={(e) => setNewSession({ ...newSession, invigilator: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-5 flex gap-3">
            <button
              onClick={handleAddSession}
              className={`flex-1 ${editingId ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'} text-white font-black rounded-xl py-4 transition-all shadow-lg active:scale-95 text-lg`}
            >
              {editingId ? '確認修改' : '確認新增'}
            </button>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-black rounded-xl py-4 transition-all shadow-lg active:scale-95 text-lg"
              >
                取消
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black mb-6 border-b border-slate-700 pb-3">行程清單總覽</h2>
        <div className="space-y-3">
          {sessions.sort((a,b) => a.startTime.localeCompare(b.startTime)).map((s) => (
            <div key={s.id} className={`flex items-center justify-between bg-slate-800/50 p-4 rounded-xl group border ${editingId === s.id ? 'border-blue-500' : 'border-white/5'}`}>
              <span className="font-bold">
                <span className="text-blue-400">{s.startTime} - {s.endTime}</span> | 
                <span className="text-white ml-2">{s.subject}</span> 
                <span className="text-slate-500 ml-2">[{s.class}]</span>
              </span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditSession(s)} className="text-blue-400 hover:text-blue-300 px-3 py-1 rounded transition-colors">編輯</button>
                <button onClick={() => handleDeleteSession(s.id)} className="text-red-400 hover:text-red-300 px-3 py-1 rounded transition-colors">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
