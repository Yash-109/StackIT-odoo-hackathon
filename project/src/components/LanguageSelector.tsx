import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { languages } from '../data/translations';

interface LanguageSelectorProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, onToggle, onClose }) => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const handleLanguageChange = (langCode: 'en' | 'hi') => {
    changeLanguage(langCode);
    onClose();
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 text-white hover:text-blue-200 transition-colors p-2.5 rounded-xl hover:bg-white/10"
      >
        <Globe className="h-5 w-5" />
        <span className="hidden md:inline text-sm font-medium">{t('languageSwitch')}</span>
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={onClose} />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Select Language</p>
              <p className="text-xs text-gray-500">Choose your preferred language</p>
            </div>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 flex items-center justify-between transition-all group"
              >
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-700">{language.nativeName}</div>
                  <div className="text-sm text-gray-500">{language.name}</div>
                </div>
                {currentLanguage === language.code && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;