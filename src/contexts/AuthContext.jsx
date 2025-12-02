import { createContext, useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { authAPI } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const publicRoutes = ['/login', '/register'];

    if (publicRoutes.includes(location.pathname)) {
      setLoading(false);
      return;
    }

    checkSession();
  }, [location.pathname]);

  const checkSession = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.warn('Could not save user to localStorage:', error);
      }
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        register, 
        logout, 
        loading, 
        checkSession,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};