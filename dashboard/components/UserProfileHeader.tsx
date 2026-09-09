import React from 'react';

interface UserProfileHeaderProps {
  name: string;
  avatarUrl: string;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ name, avatarUrl }) => {
  return (
    <div className="flex items-center space-x-4 animate-fade-in-down" style={{ animationFillMode: 'forwards' }}>
      <div className="text-right">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Welcome,</p>
        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 -mt-1">
          {name}
        </p>
      </div>
      <div className="relative group flex-shrink-0">
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-white/20 group-hover:border-blue-500/80 dark:group-hover:border-cyan-400/80 transition-all duration-300"
        />
        <div className="absolute -inset-1 rounded-full border-2 border-blue-500 dark:border-cyan-400 opacity-0 group-hover:opacity-70 group-hover:animate-pulse-slow blur-sm transition-all duration-300"></div>
      </div>
    </div>
  );
};