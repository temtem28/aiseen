import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  showTagline?: boolean;
}

const Logo = ({ size = 'md', clickable = true, showTagline = false }: LogoProps) => {
  const navigate = useNavigate();

  const sizes = {
    sm: { icon: 28, text: 'text-lg', tagline: 'text-[10px]', gap: 'gap-2' },
    md: { icon: 36, text: 'text-xl', tagline: 'text-xs', gap: 'gap-2.5' },
    lg: { icon: 48, text: 'text-3xl', tagline: 'text-sm', gap: 'gap-3' },
  };

  const s = sizes[size];

  return (
    <div
      className={`flex items-center ${s.gap} ${clickable ? 'cursor-pointer select-none' : ''}`}
      onClick={clickable ? () => navigate('/') : undefined}
    >
      {/* Icon */}
      <div
        style={{ width: s.icon, height: s.icon }}
        className="rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20"
      >
        <svg
          width={s.icon * 0.58}
          height={s.icon * 0.58}
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Eye shape */}
          <path
            d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Pupil */}
          <circle cx="12" cy="12" r="3.5" fill="white" />
          {/* AI spark */}
          <circle cx="12" cy="12" r="1.5" fill="#06b6d4" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight ${s.text} text-white`}>
          AI<span className="text-cyan-400">SEEN</span>
        </span>
        {showTagline && (
          <span className={`${s.tagline} text-gray-500 font-medium mt-0.5`}>
            AI Visibility Platform
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
