import React, { createContext, useContext, useState, useEffect } from 'react';
import { Avatar } from '@mantine/core';
import axios from 'axios';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('user');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8000/api/users/login/', {
        username: email,
        password: password
      });

      if (response.data.access) {
        const userData = {
          name: email.split('@')[0],
          email: email,
          image: 'https://example.com/default-avatar.png'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.access);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8000/api/users/register/', {
        username: email,
        email: email,
        password: password
      });

      if (response.data.user) {
        const userData = {
          name: name,
          email: response.data.user.email,
          image: 'https://example.com/default-avatar.png'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.data.access);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
