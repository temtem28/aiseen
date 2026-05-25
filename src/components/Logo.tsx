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
    sm: { img: 28, tagline: 'text-[10px]' },
    md: { img: 36, tagline: 'text-xs' },
    lg: { img: 52, tagline: 'text-sm' },
  };

  const s = heights[size];

  return (
    <div
      className={`flex flex-col items-start ${clickable ? 'cursor-pointer select-none' : ''}`}
      onClick={clickable ? () => navigate('/') : undefined}
    >
      <img
        src="/logo-zineris.png"
        alt="Zineris"
        style={{ height: s.img, width: 'auto', objectFit: 'contain' }}
        onError={(e) => {
          // Fallback si l'image ne charge pas
          const target = e.currentTarget;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'block';
        }}
      />
      {/* Fallback texte si l'image échoue */}
      <span
        style={{ display: 'none' }}
        className={`font-extrabold tracking-widest uppercase text-white ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl'}`}
      >
        ZINERIS
      </span>
      {showTagline && (
        <span className={`${s.tagline} text-gray-500 font-medium mt-0.5`}>
          AI Visibility Platform
        </span>
      )}
    </div>
  );
};

export default Logo;
