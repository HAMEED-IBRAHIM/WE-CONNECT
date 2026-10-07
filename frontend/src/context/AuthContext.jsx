import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, usersApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (credentials) => {
    const { data } = await authApi.register(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await usersApi.getMe();
      const updated = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  }, [user]);

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isAlumni = user?.role === 'ROLE_ALUMNI';
  const isStudent = user?.role === 'ROLE_STUDENT';
  const isVerified = user?.verificationStatus === 'APPROVED';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isAdmin,
      isAlumni,
      isStudent,
      isVerified,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
