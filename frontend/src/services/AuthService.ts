import api from './api';
import { User } from '../types';

// Interface para a resposta da API que encapsula os dados em um objeto 'data'
interface ApiResponse {
  success: boolean;
  data: {
    user: User;
    token?: string; // O token é opcional, pois não vem no registro
  };
  message?: string;
}

// A resposta que as funções de autenticação retornam para o resto da aplicação
interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Realiza o login do usuário
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔄 AuthService: Tentando login para:', email);
      
      // O seu api.ts já retorna o objeto de dados completo do backend
      const response: ApiResponse = await api.post('/auth/login', {
        email,
        password
      });

      console.log('✅ AuthService: Resposta recebida do servidor', response);

      // --- CORREÇÃO ---
      // Acessamos os dados diretamente de 'response.data', pois 'response'
      // já é o objeto de dados que o backend enviou.
      const responseData = response.data;

      if (!responseData || !responseData.user || !responseData.token) {
        throw new Error('Resposta inválida do servidor: dados de usuário ou token ausentes.');
      }

      return {
        user: responseData.user,
        token: responseData.token,
      };
    } catch (error: any) {
      console.error('❌ AuthService: Erro no login:', error);
      // Mantém seu tratamento de erro aprimorado
      throw new Error(error.response?.data?.message || 'Erro desconhecido durante o login');
    }
  }

  /**
   * Registra um novo cliente
   */
  async registerClient(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }): Promise<AuthResponse> {
    try {
      console.log('🔄 AuthService: Registrando novo cliente:', userData.email);
      
      const response: ApiResponse = await api.post('/auth/register/client', userData);
      
      // CORREÇÃO: Acessa os dados da mesma forma que no login
      const responseData = response.data;

      if (!responseData || !responseData.user) {
        throw new Error('Resposta inválida do servidor ao registrar cliente.');
      }

      return {
        user: responseData.user,
        token: responseData.token || '', // O token pode não vir no registro
      };
    } catch (error: any) {
      console.error('❌ AuthService: Erro no registro de cliente:', error);
      if (error.response?.status === 409) {
        throw new Error('Este email já está em uso');
      } else {
        throw new Error(error.response?.data?.message || 'Erro durante o registro');
      }
    }
  }

  /**
   * Registra um novo correspondente
   */
  async registerCorrespondent(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    specialties?: string[];
  }): Promise<AuthResponse> {
    try {
      console.log('🔄 AuthService: Registrando novo correspondente:', userData.email);
      
      const response: ApiResponse = await api.post('/auth/register/correspondent', userData);
      
      // CORREÇÃO: Acessa os dados da mesma forma que no login
      const responseData = response.data;

       if (!responseData || !responseData.user) {
        throw new Error('Resposta inválida do servidor ao registrar correspondente.');
      }
      
      return {
        user: responseData.user,
        token: responseData.token || '',
      };
    } catch (error: any) {
      console.error('❌ AuthService: Erro no registro de correspondente:', error);
      if (error.response?.status === 409) {
        throw new Error('Este email já está em uso');
      } else {
        throw new Error(error.response?.data?.message || 'Erro durante o registro');
      }
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * Obtém o usuário atual do localStorage
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      localStorage.removeItem('user');
    }
    return null;
  }

  /**
   * Obtém o token atual do localStorage
   */
  getCurrentToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Limpa os dados de autenticação
   */
  clearAuth(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  /**
   * Verifica a saúde do backend
   */
  async checkHealth(): Promise<boolean> {
    try {
      // O seu api.ts já retorna os dados, então não precisamos acessar .status aqui
      await api.get('/auth/health');
      return true;
    } catch (error) {
      console.warn('Health check falhou:', error);
      return false;
    }
  }
}

// Exporta a CLASSE para manter o padrão Singleton.
export default AuthService;
