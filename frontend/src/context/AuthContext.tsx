"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Setup global Axios interceptor to always attach token if present
if (typeof window !== 'undefined') {
  axios.interceptors.request.use((config) => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
    return config;
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const performAutoLogin = async () => {
    try {
      // Auto login as default user so the user never has to repeatedly log in
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: "inspector@compliance.ai",
        password: "password123"
      });
      const newToken = res.data.access_token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      const meRes = await axios.get(`${API_URL}/auth/me`);
      setUser(meRes.data);
    } catch (err) {
      console.warn("Auto-login fallback failed", err);
    }
  };

  // Initialize Auth
  useEffect(() => {
    async function loadStoredAuth() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const res = await axios.get(`${API_URL}/auth/me`);
          setUser(res.data);
        } catch (err) {
          console.error("Token validation failed, attempting auto-login", err);
          await performAutoLogin();
        }
      } else {
        // Automatically authenticate so user does not need to fill login form
        await performAutoLogin();
      }
      setLoading(false);
    }
    loadStoredAuth();
  }, []);

  // Handle routing: redirect from login/register to dashboard if logged in
  useEffect(() => {
    if (!loading) {
      const publicPaths = ['/login', '/register'];
      const isAuthPage = publicPaths.includes(pathname || '');
      if (user && isAuthPage) {
        router.push('/dashboard');
      }
    }
  }, [user, pathname, loading, router]);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    await refreshUser();
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      setUser(res.data);
    } catch (err) {
      console.error("Failed to refresh user", err);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
