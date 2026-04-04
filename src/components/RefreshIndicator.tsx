import { useState, useEffect } from 'react';

const POLL_INTERVAL = 60;

export function RefreshIndicator() {
  const [secondsLeft, setSecondsLeft] = useState(POLL_INTERVAL);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? POLL_INTERVAL : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative p-[1px] rounded-lg overflow-hidden">
      {/* Animated border — rotating conic gradient */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `conic-gradient(from ${((POLL_INTERVAL - secondsLeft) / POLL_INTERVAL) * 360}deg, #3b82f6, #3b82f600 120deg)`,
          transition: 'background 0.3s linear',
        }}
      />
      {/* Inner content */}
      <div className="relative bg-gray-900 rounded-lg px-3 py-1.5 flex items-center gap-2">
        <div className="relative w-3 h-3">
          <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
          <span className="absolute inset-0.5 rounded-full bg-blue-500" />
        </div>
        <span className="text-xs text-gray-400 tabular-nums font-medium">
          {secondsLeft}s
        </span>
      </div>
    </div>
  );
}
