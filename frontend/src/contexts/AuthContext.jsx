import { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Theme state synced with localStorage (default: dark)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('salestrack_theme') || 'dark';
  });

  useEffect(() => {
    // Check if user credentials exist in local storage on load
    const storedToken = localStorage.getItem('salestrack_token');
    const storedUser = localStorage.getItem('salestrack_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Sync HTML document class list with active theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('salestrack_theme', next);
      return next;
    });
  };

  const loginUser = async (email, password) => {
    try {
      const response = await api.login(email, password);
      if (response.success) {
        const { accessToken, user: userData } = response.data;
        
        setToken(accessToken);
        setUser(userData);
        
        localStorage.setItem('salestrack_token', accessToken);
        localStorage.setItem('salestrack_user', JSON.stringify(userData));
        return { success: true };
      }
    } catch (error) {
      console.error('Login failed in AuthContext:', error);
      return { 
        success: false, 
        error: error.message || 'Identifiants invalides.' 
      };
    }
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('salestrack_token');
    localStorage.removeItem('salestrack_user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdminOrManager: user ? (user.role === 'ADMIN' || user.role === 'MANAGER') : false,
    theme,
    toggleTheme,
    loginUser,
    logoutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
