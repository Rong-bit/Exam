
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  className?: string;
  onFinished?: () => void;
  showProgressBar?: boolean; // 是否顯示進度條
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  startTime, 
  endTime, 
  className = "", 
  onFinished,
  showProgressBar = true 
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [progress, setProgress] = useState<number>(100);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const start = new Date();
      start.setHours(startHours, startMinutes, 0, 0);
      
      const target = new Date();
      target.setHours(endHours, endMinutes, 0, 0);

      // 如果結束時間小於開始時間（跨午夜，雖然考試少見，但增加健壯性）
      if (target.getTime() < start.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      if (start.getTime() < now.getTime() && (now.getTime() - start.getTime() > 12 * 60 * 60 * 1000)) {
        start.setDate(start.getDate() + 1);
        target.setDate(target.getDate() + 1);
      }

      const totalDuration = target.getTime() - start.getTime();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setProgress(0);
        if (onFinished) onFinished();
        return;
      }

      // 計算進度百分比
      const progressPercent = Math.max(0, Math.min(100, (diff / totalDuration) * 100));
      setProgress(progressPercent);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setIsUrgent(diff < 5 * 60 * 1000); // 低於5分鐘為緊急狀態

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [startTime, endTime, onFinished]);

  if (showProgressBar) {
    // 根據進度決定顏色
    const getProgressColor = () => {
      if (progress > 50) return 'bg-green-500';
      if (progress > 25) return 'bg-yellow-500';
      if (progress > 10) return 'bg-orange-500';
      return 'bg-red-500';
    };

    const progressColor = getProgressColor();

    return (
      <div className={`${className} w-full`}>
        <div className="w-full bg-slate-700/50 rounded-full h-8 md:h-12 overflow-hidden border-2 border-white/20 relative">
          <div 
            className={`${progressColor} h-full transition-all duration-1000 ease-linear ${isUrgent ? 'animate-pulse' : ''}`}
            style={{ width: `${progress}%` }}
          >
          </div>
        </div>
      </div>
    );
  }

  return (
    <span className={`${className} font-mono ${isUrgent ? 'text-yellow-400 animate-pulse' : ''}`}>
      {timeLeft}
    </span>
  );
};

export default CountdownTimer;
