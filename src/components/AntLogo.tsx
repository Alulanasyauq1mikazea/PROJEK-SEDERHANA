import React from 'react';

interface AntLogoProps {
  className?: string;
  size?: number;
}

export const AntLogo: React.FC<AntLogoProps> = ({ className = "w-6 h-6", size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      {/* Antennae */}
      <path d="M9 4.5 C7.5 2.5 5 2 4 2.5" />
      <path d="M15 4.5 C16.5 2.5 19 2 20 2.5" />
      
      {/* Head */}
      <circle cx="12" cy="6" r="2" fill="currentColor" fillOpacity="0.2" />

      {/* Thorax (Middle Body) */}
      <ellipse cx="12" cy="11.5" rx="2.2" ry="2.8" fill="currentColor" fillOpacity="0.2" />

      {/* Abdomen (Rear Body) */}
      <ellipse cx="12" cy="18" rx="3" ry="3.8" fill="currentColor" fillOpacity="0.3" />

      {/* Front Legs */}
      <path d="M10 10 L6 8.5 L3 10" />
      <path d="M14 10 L18 8.5 L21 10" />

      {/* Middle Legs */}
      <path d="M9.8 12 L5 12.5 L2.5 15" />
      <path d="M14.2 12 L19 12.5 L21.5 15" />

      {/* Back Legs */}
      <path d="M9.5 17 L5.5 18.5 L3.5 21.5" />
      <path d="M14.5 17 L18.5 18.5 L20.5 21.5" />
    </svg>
  );
};
