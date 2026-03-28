import React, { useEffect, useState } from "react";

const TOTAL_STEPS = 4;
const RADIUS = 25;
const STROKE = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const Stepper = ({ currentStep }) => {
  const [progress, setProgress] = useState(0);
  const targetProgress = (currentStep / TOTAL_STEPS) * 100;

  useEffect(() => {
    let start = progress;
    let end = targetProgress;
    let step = start < end ? 1 : -1;

    const timer = setInterval(() => {
      start += step;
      setProgress(start);
      if (start === end) clearInterval(timer);
    }, 8);

    return () => clearInterval(timer);
  }, [targetProgress]);

  const offset =
    CIRCUMFERENCE - (CIRCUMFERENCE * progress) / 100;

  return (
    <div className="relative w-[80px] h-[80px] flex items-center justify-center">
      <svg
        width="80"
        height="80"
        className="-rotate-90"
      >
        {/* background */}
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          stroke="#e5e7eb"
          strokeWidth={STROKE}
          fill="none"
        />

        {/* progress */}
        <circle
          cx="40"
          cy="40"
          r={RADIUS}
          stroke="#022FB0"
          strokeWidth={STROKE + 1}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>

      {/* center text */}
      <div className="absolute text-xs font-semibold text-[#FFFFFF]">
        {currentStep}/{TOTAL_STEPS}
      </div>
    </div>
  );
};
