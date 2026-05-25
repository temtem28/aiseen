import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  showTagline?: boolean;
}

const Logo = ({ size = 'md', clickable = true, showTagline = false }: LogoProps) => {
  const navigate = useNavigate();

  const heights = {
    sm: { h: 26, tagline: 'text-[9px]' },
    md: { h: 34, tagline: 'text-[10px]' },
    lg: { h: 48, tagline: 'text-xs' },
  };

  const s = heights[size];

  return (
    <div
      className={`flex flex-col items-start gap-0.5 ${clickable ? 'cursor-pointer select-none' : ''}`}
      onClick={clickable ? () => navigate('/') : undefined}
    >
      <img
        src="/logo-zineris.svg"
        alt="ZINERIS"
        style={{ height: s.h, width: 'auto', objectFit: 'contain' }}
      />
      {showTagline && (
        <span className={`${s.tagline} text-gray-500 font-medium tracking-wide`}>
          AI Visibility Platform
        </span>
      )}
    </div>
  );
};

export default Logo;
