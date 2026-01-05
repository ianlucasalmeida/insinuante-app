import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../constants/Config';

type User = {
  id: string; 
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  birthdate?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: any, password: any) => Promise<any>;
  register: (userData: any, addressData: any) => Promise<any>;
  logout: () => void;
  updateUserContext: (user: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const SESSION_KEY = 'insinuante_session_user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(SESSION_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user session', e);
      } finally {
        setLoading(false);
      }
    };
    loadUserFromStorage();
  }, []);

  const login = async (email: any, password: any) => {
    try {
      // 1. Usa POST e envia no corpo (Segurança Profissional)
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      const userData = response.data;
      setUser(userData);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      router.replace('/(tabs)');
      return { success: true };
    } catch (e: any) {
      console.error("ERRO NO LOGIN:", e.response?.data || e.message);
      return { success: false, error: e.response?.data?.error || 'Email ou senha incorretos.' };
    }
  };

  const register = async (userData: any, addressData: any) => {
    try {
      // 2. ENVIE TUDO EM UM ÚNICO POST PARA A ROTA PROFISSIONAL
      const response = await axios.post(`${API_URL}/auth/register`, {
        userData,
        addressData
      });

      const newUserData = response.data;
      setUser(newUserData);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUserData));
      router.replace('/(tabs)');
      return { success: true };

    } catch (e: any) {
      // 3. CAPTURA O ERRO REAL (importante para saber se o IP está errado ou se o banco rejeitou)
      console.error("ERRO NO REGISTRO:", e.response?.data || e.message);
      return { success: false, error: e.response?.data?.error || 'Erro de rede ou dados inválidos.' };
    }
  };
  const updateUserContext = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.error("Erro ao atualizar sessão:", e);
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};