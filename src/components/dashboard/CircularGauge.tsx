import { useEffect, useState } from 'react';

interface CircularGaugeProps {
  value: number;
  maxValue?: number;
  label: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showTrend?: boolean;
  trend?: number;
}

export default function CircularGauge({ 
  value, 
  maxValue = 100, 
  label, 
  suffix = '',
  size = 'md',
  color = '#22d3ee',
  showTrend = false,
  trend = 0
}: CircularGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  const sizeConfig = {
    sm: { width: 120, strokeWidth: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
    md: { width: 160, strokeWidth: 10, fontSize: 'text-3xl', labelSize: 'text-sm' },
    lg: { width: 200, strokeWidth: 12, fontSize: 'text-4xl', labelSize: 'text-base' }
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2 - 10;
  const circumference = radius * 2 * Math.PI;
  const percentage = (animatedValue / maxValue) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-20"
          style={{ backgroundColor: color }}
        />
        
        <svg className="transform -rotate-90" width={config.width} height={config.width}>
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke="#1a2332"
            strokeWidth={config.strokeWidth}
            fill="none"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id={`gauge-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke={`url(#gauge-gradient-${label})`}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 1.5s ease-out',
              filter: `drop-shadow(0 0 6px ${color})`
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.fontSize} font-bold text-white`}>
            {Math.round(animatedValue).toLocaleString()}{suffix}
          </span>
          {showTrend && trend !== 0 && (
            <span className={`text-xs ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </div>
      <span className={`mt-3 ${config.labelSize} font-medium text-gray-400`}>{label}</span>
    </div>
  );
}
