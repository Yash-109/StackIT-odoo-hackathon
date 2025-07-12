import React from 'react';
import { User, Settings, LogOut, Award, BookOpen, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import UserAvatar from './UserAvatar';

interface UserMenuProps {
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const menuItems = [
    { icon: User, label: t('profile'), action: () => console.log('Profile') },
    { icon: BookOpen, label: t('myQuestions'), action: () => console.log('My Questions') },
    { icon: Heart, label: t('followedQuestions'), action: () => console.log('Followed Questions') },
    { icon: Award, label: t('badgesEarned'), action: () => console.log('Badges') },
    { icon: Settings, label: t('settings'), action: () => console.log('Settings') },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-10" onClick={onClose} />
      
      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <UserAvatar
              src={user?.avatar}
              alt={user?.name || 'User'}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email || user?.phone}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Award className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-gray-600">{user?.reputation} {t('reputation')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Icon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div className="border-t border-gray-100 pt-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">{t('logout')}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default UserMenu;