import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import axios from 'axios'; // 1. USANDO AXIOS

// 2. 🚨 VERIFIQUE SE ESTE IP AINDA ESTÁ CORRETO! 🚨
const API_URL = 'http://192.168.0.103:3001'; 

// O 'User' precisa ter os campos novos
type User = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthdate: string;
};

// 3. ATUALIZANDO O CONTEXT TYPE
type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email, password) => Promise<any>;
  // 'register' agora espera dois objetos
  register: (userData: any, addressData: any) => Promise<any>; 
  logout: () => void;
  // Função para a tela de 'configuracoes'
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

  const login = async (email, password) => {
    try {
      const response = await axios.get(`${API_URL}/users?email=${email}&password=${password}`);
      
      if (response.data && response.data.length > 0) {
        const userData = response.data[0];
        setUser(userData);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userData));
        router.replace('/(tabs)');
        return { success: true };
      }
      return { success: false, error: 'Email ou senha inválidos' };
    } catch (e: any) {
      console.error("ERRO DE CONEXÃO NO LOGIN:", e.message);
      return { success: false, error: 'Network Error: Verifique o IP e o json-server.' };
    }
  };

  // 4. 👇 FUNÇÃO 'register' ATUALIZADA
  const register = async (userData: any, addressData: any) => {
     try {
      // Etapa 1: Verificar se o email já existe
      const check = await axios.get(`${API_URL}/users?email=${userData.email}`);
      if (check.data && check.data.length > 0) {
        return { success: false, error: 'Este email já está cadastrado' };
      }
      
      // Etapa 2: Criar o Usuário (POST /users)
      const userResponse = await axios.post(`${API_URL}/users`, { 
        name: userData.name, 
        email: userData.email, 
        password: userData.password,
        cpf: userData.cpf,
        phone: userData.phone,
        birthdate: userData.birthdate
      });
      
      const newUserData = userResponse.data;
      const newUserId = newUserData.id;

      // Etapa 3: Criar o Endereço (POST /addresses)
      // O 'addressData' vem da tela de cadastro
      await axios.post(`${API_URL}/addresses`, {
        ...addressData,
        userId: newUserId,
        isPrimary: true // Marcamos como endereço principal
      });
      
      // Etapa 4: Logar o usuário e finalizar
      setUser(newUserData);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newUserData));
      router.replace('/(tabs)');
      return { success: true };

    } catch (e: any) {
      console.error("ERRO DE CONEXÃO NO REGISTRO:", e.message);
      return { success: false, error: 'Network Error: Verifique o IP e o json-server.' };
    }
  };

  // 5. 👇 FUNÇÃO 'updateUserContext' ADICIONADA
  // (Para a tela de 'configuracoes' funcionar)
  const updateUserContext = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      console.error("Erro ao atualizar sessão do usuário:", e);
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
    router.replace('/(auth)/login');
  };

  // 6. 👇 'value' ATUALIZADO
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};