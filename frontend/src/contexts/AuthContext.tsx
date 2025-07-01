import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import AuthService from '../services/AuthService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário salvo no localStorage
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        
        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
        // Limpar dados corrompidos
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await AuthService.login({ email, password });
      
      // Salvar usuário e token no localStorage
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Se o backend não estiver disponível, usar dados mockados temporariamente
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.warn('Backend não disponível, usando dados mockados');
        
        // Mock user data baseado no email para desenvolvimento
        let mockUser: User;
        
        if (email === 'admin@jurisconnect.com') {
          mockUser = {
            id: '1',
            name: 'Administrador',
            email: 'admin@jurisconnect.com',
            role: 'admin',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z'
          };
        } else if (email === 'cliente@exemplo.com') {
          mockUser = {
            id: '2',
            name: 'João Silva',
            email: 'cliente@exemplo.com',
            role: 'client',
            status: 'active',
            createdAt: '2024-01-15T00:00:00Z',
            phone: '(11) 99999-9999'
          };
        } else {
          mockUser = {
            id: '3',
            name: 'Maria Santos',
            email: 'correspondente@exemplo.com',
            role: 'correspondent',
            status: 'active',
            createdAt: '2024-01-20T00:00:00Z',
            phone: '(11) 88888-8888',
            oab: 'SP123456',
            city: 'São Paulo',
            state: 'SP'
          };
        }
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock_token_' + Date.now());
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

