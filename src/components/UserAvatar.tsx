import React from 'react';
import { PolygonLogo } from './PolygonLogo';

interface UserAvatarProps {
  avatar?: string;
  size?: number;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ avatar, size = 46, className = '' }) => {
  const isPolygon = !avatar || avatar === 'polygon';

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full overflow-hidden flex items-center justify-center bg-white shrink-0 ${className}`}
    >
      {isPolygon ? (
        <PolygonLogo size={Math.round(size * 0.82)} />
      ) : (
        <img
          src={avatar}
          alt="Profile Avatar"
          className="w-full h-full object-cover rounded-full"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback to polygon if image load fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      )}
    </div>
  );
};
