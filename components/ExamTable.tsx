
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
    <div className="overflow-hidden rounded-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-3 text-white font-bold uppercase tracking-wider text-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] border-b border-white/20">狀態</th>
            <th className="px-4 py-3 text-white font-bold uppercase tracking-wider text-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] border-b border-white/20">時間與倒數</th>
            <th className="px-4 py-3 text-white font-bold uppercase tracking-wider text-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] border-b border-white/20">科目</th>
            <th className="px-4 py-3 text-white font-bold uppercase tracking-wider text-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] border-b border-white/20">班級</th>
            <th className="px-4 py-3 text-white font-bold uppercase tracking-wider text-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] border-b border-white/20">考場</th>
            <th className="px-4 py-3 text-white font-bold uppercase tracking-wider text-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] border-b border-white/20">監考老師</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/20">
          {sessions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-white text-lg font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                目前尚無安排考試行程
              </td>
            </tr>
          ) : (
            sessions.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((session) => {
              const status = getStatus(session.startTime, session.endTime);
              return (
                <tr 
                  key={session.id} 
                  className="transition-colors duration-300"
                >
                  <td className="px-4 py-4">
                    {status === 'ongoing' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-600/90 backdrop-blur-sm text-white animate-pulse drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        進行中
                      </span>
                    ) : status === 'upcoming' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-600/90 backdrop-blur-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        即將開始
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-black/40 backdrop-blur-sm text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        已結束
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    <div className="text-base text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      {session.startTime} - {session.endTime}
                    </div>
                    {status === 'ongoing' && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-red-300 font-bold uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">剩餘</span>
                        <CountdownTimer 
                          endTime={session.endTime} 
                          className="text-sm text-white font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" 
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-lg font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {session.subject}
                  </td>
                  <td className="px-4 py-4 text-base text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {session.class}
                  </td>
                  <td className="px-4 py-4 text-lg font-bold text-blue-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {session.room}
                  </td>
                  <td className="px-4 py-4 text-sm text-white italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
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
