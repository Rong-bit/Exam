
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: string; // HH:mm
  className?: string;
  onFinished?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, className = "", onFinished }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const target = new Date();
      target.setHours(endHours, endMinutes, 0, 0);

      // 如果結束時間小於開始時間（跨午夜，雖然考試少見，但增加健壯性）
      if (target.getTime() < now.getTime() && (now.getTime() - target.getTime() > 12 * 60 * 60 * 1000)) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        if (onFinished) onFinished();
        return;
      }

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
  }, [endTime, onFinished]);

  return (
    <span className={`${className} font-mono ${isUrgent ? 'text-yellow-400 animate-pulse' : ''}`}>
      {timeLeft}
    </span>
  );
};

export default CountdownTimer;
