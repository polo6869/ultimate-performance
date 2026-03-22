"use client";

import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number | null;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

export default function ScoreRing({
  score,
  size = 200,
  strokeWidth = 14,
  color = "#2563EB",
}: ScoreRingProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = score != null ? Math.min(Math.max(score, 0), 100) / 100 : 0;
  const offset = circumference * (1 - (animated ? pct : 0));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rotate-[-90deg]"
      aria-label={`Score: ${score ?? "—"}`}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#1e1e1e"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.25,0.46,0.45,0.94)" }}
      />
    </svg>
  );
}
