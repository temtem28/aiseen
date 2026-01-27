import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  label: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreGauge({ 
  score, 
  maxScore = 100, 
  label, 
  color,
  size = 'md' 
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const sizeConfig = {
    sm: { width: 80, strokeWidth: 6, fontSize: 'text-lg' },
    md: { width: 120, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { width: 160, strokeWidth: 10, fontSize: 'text-4xl' }
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (animatedScore / maxScore) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={config.width} height={config.width}>
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            fill="none"
            className="text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke={color}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-out'
            }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.fontSize} font-bold ${getScoreColor()}`}>
            {Math.round(animatedScore)}
          </span>
          <span className="text-xs text-gray-500">/{maxScore}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-300">{label}</span>
    </div>
  );
}
