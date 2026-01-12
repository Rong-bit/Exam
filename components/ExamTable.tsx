
import React from 'react';
import { ExamSession } from '../types';
import CountdownTimer from './CountdownTimer';

interface ExamTableProps {
  sessions: ExamSession[];
  currentTime: string;
}

const ExamTable: React.FC<ExamTableProps> = ({ sessions, currentTime }) => {
  const getStatus = (start: string, end: string) => {
    if (currentTime < start) return 'upcoming';
    if (currentTime >= start && currentTime < end) return 'ongoing';
    return 'finished';
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-transparent backdrop-blur-sm shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-transparent">
            <th className="px-4 py-3 text-slate-200 font-bold uppercase tracking-wider text-xs drop-shadow-md border-b border-white/5">狀態</th>
            <th className="px-4 py-3 text-slate-200 font-bold uppercase tracking-wider text-xs drop-shadow-md border-b border-white/5">時間與倒數</th>
            <th className="px-4 py-3 text-slate-200 font-bold uppercase tracking-wider text-xs drop-shadow-md border-b border-white/5">科目</th>
            <th className="px-4 py-3 text-slate-200 font-bold uppercase tracking-wider text-xs drop-shadow-md border-b border-white/5">班級</th>
            <th className="px-4 py-3 text-slate-200 font-bold uppercase tracking-wider text-xs drop-shadow-md border-b border-white/5">監考老師</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {sessions.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-300 text-lg font-medium">
                目前尚無安排考試行程
              </td>
            </tr>
          ) : (
            sessions.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((session) => {
              const status = getStatus(session.startTime, session.endTime);
              return (
                <tr 
                  key={session.id} 
                  className={`transition-colors duration-300 bg-transparent`}
                >
                  <td className="px-4 py-4">
                    {status === 'ongoing' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse shadow-lg">
                        進行中
                      </span>
                    ) : status === 'upcoming' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-lg">
                        即將開始
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-slate-700/80 text-slate-300">
                        已結束
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    <div className="text-base text-slate-100 drop-shadow-md">
                      {session.startTime} - {session.endTime}
                    </div>
                    {status === 'ongoing' && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-red-400 font-bold uppercase">剩餘</span>
                        <CountdownTimer 
                          endTime={session.endTime} 
                          className="text-sm text-white font-black drop-shadow-sm" 
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-lg font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {session.subject}
                  </td>
                  <td className="px-4 py-4 text-base text-slate-100 drop-shadow-md">
                    {session.class}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-300 italic drop-shadow-md">
                    {session.invigilator || '--'}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExamTable;
