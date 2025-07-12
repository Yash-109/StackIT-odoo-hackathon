import React, { useState } from 'react';
import { Search, Bell, User, MessageCircle, Plus, Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import LanguageSelector from './LanguageSelector';
import NotificationDropdown from './NotificationDropdown';
import UserMenu from './UserMenu';
import AuthModal from './auth/AuthModal';
import UserAvatar from './UserAvatar';

interface HeaderProps {
  onAskQuestion: () => void;
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onAskQuestion, onMenuToggle, isMobileMenuOpen }) => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useNotifications();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleAskQuestion = () => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setShowAuthModal(true);
    } else {
      onAskQuestion();
    }
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-white hover:text-blue-200 transition-colors rounded-lg hover:bg-white/10"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl border border-white/30">
                <MessageCircle className="h-7 w-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">{t('appName')}</h1>
                <p className="text-xs text-blue-100">Knowledge Sharing Platform</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder-gray-500 text-gray-900"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Language Selector */}
              <div className="relative hidden sm:block">
                <LanguageSelector
                  isOpen={showLanguageSelector}
                  onToggle={() => setShowLanguageSelector(!showLanguageSelector)}
                  onClose={() => setShowLanguageSelector(false)}
                />
              </div>

              {isAuthenticated ? (
                <>
                  {/* Ask Question Button */}
                  <button
                    onClick={handleAskQuestion}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 lg:px-6 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('askQuestion')}</span>
                  </button>

                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2.5 text-white hover:text-blue-200 transition-colors rounded-xl hover:bg-white/10"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotifications && (
                      <NotificationDropdown onClose={() => setShowNotifications(false)} />
                    )}
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <UserAvatar
                        src={user?.avatar}
                        alt={user?.name || 'User'}
                        size="md"
                        className="border-2 border-white/30 shadow-lg"
                      />
                      <span className="hidden lg:inline text-sm font-medium text-white max-w-24 truncate">
                        {user?.name}
                      </span>
                    </button>
                    {showUserMenu && (
                      <UserMenu onClose={() => setShowUserMenu(false)} />
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Login/Register Buttons */}
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-white hover:text-blue-200 px-4 py-2 rounded-xl font-medium transition-colors hover:bg-white/10"
                  >
                    {t('login')}
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-4 lg:px-6 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    {t('register')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;