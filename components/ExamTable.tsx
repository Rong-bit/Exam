
import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right">
      <div className="text-5xl font-black text-white tracking-tighter px-4 py-2 bg-black border border-white/20 rounded-lg inline-block">
        {time.toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-blue-400 font-semibold text-lg uppercase tracking-widest mt-1 px-3 py-1 bg-black border border-white/20 rounded-lg inline-block">
        {time.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
      </div>
    </div>
  );
};

export default Clock;
