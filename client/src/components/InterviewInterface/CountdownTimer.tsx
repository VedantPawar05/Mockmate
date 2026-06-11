// src/components/InterviewInterface/CountdownTimer.tsx
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  durationSeconds: number;
  onExpire: () => void;
  label?: string;
  colorClass?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  durationSeconds,
  onExpire,
  label = "Time Left",
  colorClass = "text-green-400",
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    setTimeLeft(durationSeconds); // reset whenever duration changes (new question)
  }, [durationSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");
  const urgent = timeLeft < 30;

  return (
    <div className={`flex flex-col items-center ${urgent ? "text-red-400 animate-pulse" : colorClass}`}>
      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</span>
      <span className="text-2xl font-mono font-bold">{mins}:{secs}</span>
    </div>
  );
};

