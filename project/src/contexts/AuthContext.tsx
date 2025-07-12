import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  language: 'en' | 'hi';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email,
      avatar: `https://ui-avatars.com/api/?name=John+Doe&background=3B82F6&color=fff&size=200`,
      reputation: 1250,
      joinDate: new Date().toISOString(),
      language: 'en',
      isVerified: true,
      preferences: {
        contentLanguage: 'both',
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        answerNotifications: true,
        followNotifications: true,
        theme: 'light'
      },
      followedTags: ['javascript', 'react', 'nodejs'],
      blockedUsers: []
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    setAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const loginWithPhone = async (phone: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      phone,
      email: '',
      avatar: `https://ui-avatars.com/api/?name=John+Doe&background=3B82F6&color=fff&size=200`,
      reputation: 1250,
      joinDate: new Date().toISOString(),
      language: 'en',
      isVerified: true,
      preferences: {
        contentLanguage: 'both',
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        answerNotifications: true,
        followNotifications: true,
        theme: 'light'
      },
      followedTags: ['javascript', 'react', 'nodejs'],
      blockedUsers: []
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    setAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const register = async (userData: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email || '',
      phone: userData.phone || '',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=3B82F6&color=fff&size=200`,
      reputation: 0,
      joinDate: new Date().toISOString(),
      language: userData.language,
      isVerified: false,
      preferences: {
        contentLanguage: 'both',
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        answerNotifications: true,
        followNotifications: true,
        theme: 'light'
      },
      followedTags: [],
      blockedUsers: []
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    setAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    loginWithPhone,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};