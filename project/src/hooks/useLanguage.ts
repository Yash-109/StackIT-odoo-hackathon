import { useState, useCallback, useEffect } from 'react';
import { translations } from '../data/translations';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi'>('en');

  const t = useCallback((key: string) => {
    return translations[currentLanguage][key as keyof typeof translations[typeof currentLanguage]] || key;
  }, [currentLanguage]);

  const changeLanguage = useCallback((lang: 'en' | 'hi') => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  }, []);

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'hi';
    if (savedLanguage && ['en', 'hi'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  return { currentLanguage, t, changeLanguage };
};