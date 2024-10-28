import React, { createContext, useContext, useState, useEffect } from 'react';
import { Avatar } from '@mantine/core';

interface User {
  name: string;
  email: string;
  image: string;
  isGuest?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeGuestUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing guest user in localStorage
    const guestUser = localStorage.getItem('guestUser');
    if (!user && !guestUser) {
      initializeGuestUser();
    } else if (!user && guestUser) {
      setUser(JSON.parse(guestUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Implement your login logic here
    setIsAuthenticated(true);
    setUser({ 
      name: 'Test User', 
      email,
      image: 'https://example.com/default-avatar.png'  // Use URL instead of Avatar component
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    // Implement your signup logic here
    setIsAuthenticated(true);
    setUser({ 
      name, 
      email,
      image: 'https://example.com/default-avatar.png' // Default avatar
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const initializeGuestUser = () => {
    const guestUser = {
      name: 'Guest',
      email: `guest_${Date.now()}@example.com`,
      image: 'https://example.com/default-avatar.png',
      isGuest: true
    };
    setUser(guestUser);
    localStorage.setItem('guestUser', JSON.stringify(guestUser));
  };

  // Add initializeGuestUser to the context value
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      signup, 
      logout,
      initializeGuestUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
