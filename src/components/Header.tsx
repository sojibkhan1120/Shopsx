import React from 'react';
import { PolygonLogo } from './PolygonLogo';

export const Header: React.FC = () => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-0 px-4 py-2.5 flex items-center justify-between shadow-xs"
    >
      <div
        className="flex items-center space-x-2.5 select-none"
        title="Polygon"
      >
        <PolygonLogo size={32} />
      </div>
    </header>
  );
};

