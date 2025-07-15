import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  size = 'md', 
  className = '', 
  showName = false,
  clickable = false,
  onClick 
}) => {
  const { user } = useAuth();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl'
  };

  const avatarClasses = `
    bg-gradient-to-br from-blue-500 to-indigo-600 
    rounded-full flex items-center justify-center 
    text-white font-semibold shadow-lg
    ${sizeClasses[size]}
    ${clickable ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : ''}
    ${className}
  `;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (clickable && onClick) {
      console.log('ProfileAvatar clicked!');
      onClick();
    }
  };

  const avatarContent = (
    <>
      {user?.profileImage ? (
        <div 
          className={`${avatarClasses} overflow-hidden`}
          onClick={handleClick}
        >
          <img 
            src={user.profileImage} 
            alt={`${user.name} profile`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div 
          className={avatarClasses}
          onClick={handleClick}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      )}
    </>
  );

  if (showName) {
    return (
      <div className="flex items-center space-x-3">
        {avatarContent}
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Bienvenido</span>
          <span className="text-blue-700 font-semibold">
            {user?.name}
          </span>
        </div>
      </div>
    );
  }

  return avatarContent;
};

export default ProfileAvatar; 