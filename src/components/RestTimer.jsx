import { useState, useEffect, useRef } from "react";

export default function RestTimer({ restTime = 60, isActive = false, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(restTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(restTime);
    if (isRunning) {
      pauseTimer();
    }
  }, [restTime]);

  useEffect(() => {
    if (isActive && !isRunning && timeLeft > 0) {
      startTimer();
    } else if (!isActive && isRunning) {
      pauseTimer();
    }
  }, [isActive]);

  const startTimer = () => {
    if (intervalRef.current) return;

    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeLeft(restTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = restTime > 0 ? ((restTime - timeLeft) / restTime) * 100 : 0;

  return (
    <div className="rest-timer">
      <div className="timer-display">
        <div className="timer-circle">
          <svg viewBox="0 0 100 100" width="110" height="110">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#1e2937" strokeWidth="7" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#22c55e"
              strokeWidth="7"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progress) / 100}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="time-text">
            <span className="time">{formatTime(timeLeft)}</span>
            <span className="label">REST</span>
          </div>
        </div>
      </div>

      <div className="timer-controls">
        {!isRunning ? (
          <button className="btn-start" onClick={startTimer} disabled={timeLeft === 0}>
            Start Rest Timer
          </button>
        ) : (
          <button className="btn-pause" onClick={pauseTimer}>
            Pause
          </button>
        )}

        <button className="btn-reset" onClick={resetTimer}>
          Reset
        </button>
      </div>

      {timeLeft === 0 && (
        <p className="timer-complete">Rest complete! Next set ready.</p>
      )}
    </div>
  );
}