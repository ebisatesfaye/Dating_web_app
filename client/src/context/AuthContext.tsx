'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import API from '../lib/api';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (formData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser]   = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);   // true until session check completes
  const router = useRouter();

  // Restore session from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('whaatachi_token');
      if (storedToken) {
        // Optimistically set token so API interceptor works immediately
        setToken(storedToken);
        try {
          const res = await API.get('/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(res.data);
        } catch (err) {
          console.warn('[AuthContext] Session restore failed — clearing token', err);
          localStorage.removeItem('whaatachi_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Do NOT set loading=true here — it would show a spinner on the login page
    // and clear the form while waiting.
    const res = await API.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('whaatachi_token', newToken);
    setToken(newToken);
    setUser(newUser);

    // Redirect based on role
    if (newUser.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/browse');
    }
  };

  const registerUser = async (formData: any) => {
    const res = await API.post('/auth/register', formData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('whaatachi_token', newToken);
    setToken(newToken);
    setUser(newUser);
    router.push('/browse');
  };

  const logout = () => {
    localStorage.removeItem('whaatachi_token');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('[AuthContext] Could not refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
