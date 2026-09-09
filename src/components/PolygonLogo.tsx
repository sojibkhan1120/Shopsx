import React from 'react';

interface PolygonLogoProps {
  size?: number;
  className?: string;
}

export const PolygonLogo: React.FC<PolygonLogoProps> = ({ size = 36, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      id="platform-polygon-logo"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Colorful multi-facet hexagon petals matching the video */}
        {/* Top-Right: Yellow */}
        <polygon points="50,50 50,15 80,32" fill="#EAB308" />
        {/* Right: Orange */}
        <polygon points="50,50 80,32 80,68" fill="#F97316" />
        {/* Bottom-Right: Red/Pink */}
        <polygon points="50,50 80,68 50,85" fill="#EF4444" />
        {/* Bottom-Left: Violet/Purple */}
        <polygon points="50,50 50,85 20,68" fill="#8B5CF6" />
        {/* Left: Blue */}
        <polygon points="50,50 20,68 20,32" fill="#3B82F6" />
        {/* Top-Left: Green */}
        <polygon points="50,50 20,32 50,15" fill="#10B981" />
        {/* Center circle */}
        <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
