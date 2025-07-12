import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  src, 
  alt, 
  size = 'md',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (!src || imageError) {
    // Fallback avatar with user initials or default icon
    const initials = alt
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          bg-gradient-to-br from-blue-500 to-purple-600 
          flex items-center justify-center 
          text-white font-semibold text-xs
          border-2 border-gray-200 shadow-sm
          ${className}
        `}
        title={alt}
      >
        {initials || <User className="w-1/2 h-1/2" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleImageError}
      className={`
        ${sizeClasses[size]} 
        rounded-full 
        border-2 border-gray-200 
        shadow-sm 
        object-cover
        ${className}
      `}
    />
  );
};

export default UserAvatar; 