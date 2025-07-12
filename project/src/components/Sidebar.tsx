import React from 'react';
import { Home, TrendingUp, Clock, MessageCircleQuestion, User, Heart, CheckCircle, Flame, Star } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const publicTabs = [
    { id: 'all', label: t('allQuestions'), icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'recent', label: t('recent'), icon: Clock, color: 'text-green-600', bgColor: 'bg-green-100' },
    { id: 'popular', label: t('popular'), icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { id: 'trending', label: t('trending'), icon: Flame, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { id: 'unanswered', label: t('unanswered'), icon: MessageCircleQuestion, color: 'text-red-600', bgColor: 'bg-red-100' },
    { id: 'answered', label: t('answered'), icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  ];

  const authenticatedTabs = [
    { id: 'my', label: t('myQuestions'), icon: User, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { id: 'followed', label: t('followedQuestions'), icon: Heart, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  ];

  const tabs = isAuthenticated ? [...publicTabs, ...authenticatedTabs] : publicTabs;

  return (
    <div className="w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 h-screen overflow-y-auto shadow-sm">
      <nav className="p-4 space-y-2">
        <div className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Browse Questions
          </h2>
        </div>
        
        {publicTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? `${tab.bgColor} ${tab.color} border border-current/20 shadow-md transform scale-105`
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:text-gray-900 hover:shadow-sm'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="font-medium">{tab.label}</span>
              {isActive && (
                <div className="ml-auto">
                  <Star className="h-4 w-4 fill-current" />
                </div>
              )}
            </button>
          );
        })}

        {isAuthenticated && (
          <>
            <div className="mt-8 mb-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">
                Personal Space
              </h2>
            </div>
            
            {authenticatedTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    isActive
                      ? `${tab.bgColor} ${tab.color} border border-current/20 shadow-md transform scale-105`
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="font-medium">{tab.label}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  )}
                </button>
              );
            })}
          </>
        )}

        {/* Language Filter */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Content Language
          </h3>
          <div className="space-y-1">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              🇺🇸 English
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              🇮🇳 हिन्दी
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              🌍 All Languages
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;