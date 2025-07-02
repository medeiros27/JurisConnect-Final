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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se há um usuário salvo no localStorage
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('✅ Usuário autenticado encontrado:', parsedUser.email);
        } else {
          console.log('❌ Nenhum usuário autenticado encontrado');
          // Limpar dados corrompidos
          localStorage.removeItem('user');
          localStorage.removeItem('token');
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
    try {
      setIsLoading(true);
      console.log('🔄 Iniciando processo de login para:', email);

      const response = await AuthService.getInstance().login(email, password);
      console.log('✅ Login bem-sucedido, dados recebidos:', response);

      // Salvar usuário e token no localStorage
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      setIsAuthenticated(true);

      console.log('✅ Dados salvos no localStorage');
      console.log('✅ Estado de autenticação atualizado');

      // Forçar uma atualização da página para garantir que todos os componentes sejam re-renderizados
      setTimeout(() => {
        window.location.reload();
      }, 100);

    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      // Se o backend não estiver disponível, usar dados mockados temporariamente
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.warn('🔄 Backend não disponível, usando dados mockados');
        
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
            createdAt: '2024-01-01T00:00:00Z'
          };
        } else if (email === 'correspondente@exemplo.com') {
          mockUser = {
            id: '3',
            name: 'Maria Santos',
            email: 'correspondente@exemplo.com',
            role: 'correspondent',
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z'
          };
        } else {
          throw new Error('Credenciais inválidas');
        }

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock_token_' + Date.now());
        setIsAuthenticated(true);

        console.log('✅ Login mockado bem-sucedido para:', mockUser.email);
        
        // Forçar uma atualização da página
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🔄 Fazendo logout...');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('✅ Logout realizado com sucesso');
    
    // Redirecionar para a página de login
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

