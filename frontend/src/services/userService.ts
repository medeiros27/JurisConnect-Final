import api from './api';
import { User } from '../types';
import { UserFormData } from '../components/Forms/UserForm';

// Interface para a resposta da API que encapsula os dados em um objeto 'data'
interface ApiResponse {
  success: boolean;
  data: {
    users?: User[];
    user?: User;
  };
  message?: string;
}

class UserService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // --- MÉTODOS ADICIONADOS ---

  /**
   * Busca todos os correspondentes.
   */
  async getCorrespondents(state?: string, city?: string): Promise<User[]> {
    try {
      // Constrói a query string se os parâmetros forem fornecidos
      const params = new URLSearchParams();
      if (state) params.append('state', state);
      if (city) params.append('city', city);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      const response: ApiResponse = await api.get(`/users/correspondents${queryString}`);
      return response.data.users || [];
    } catch (error) {
      console.error("Erro ao buscar correspondentes:", error);
      return [];
    }
  }

  /**
   * Busca correspondentes pendentes de aprovação.
   */
  async getPendingCorrespondents(): Promise<User[]> {
    try {
      const response: ApiResponse = await api.get('/users/correspondents/pending');
      return response.data.users || [];
    } catch (error) {
      console.error("Erro ao buscar correspondentes pendentes:", error);
      return [];
    }
  }

  /**
   * Busca todos os clientes.
   */
  async getClients(): Promise<User[]> {
    try {
      const response: ApiResponse = await api.get('/users/clients');
      return response.data.users || [];
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    }
  }

  // --- SEUS MÉTODOS EXISTENTES (MANTIDOS) ---

  /**
   * Busca todos os utilizadores da API.
   */
  async getUsers(): Promise<User[]> {
    try {
        const response: ApiResponse = await api.get('/users');
        return response.data.users || [];
    } catch (error) {
        console.error("Erro ao buscar todos os usuários:", error);
        return [];
    }
  }

  /**
   * Busca um utilizador específico pelo seu ID.
   */
  async getUserById(id: string): Promise<User | null> {
    try {
        const response: ApiResponse = await api.get(`/users/${id}`);
        return response.data.user || null;
    } catch (error) {
        console.error(`Erro ao buscar usuário com ID ${id}:`, error);
        return null;
    }
  }

  /**
   * Cria um novo utilizador.
   */
  async createUser(data: UserFormData): Promise<User> {
    const response: ApiResponse = await api.post('/users', data);
    return response.data.user as User;
  }

  /**
   * Atualiza um utilizador existente.
   */
  async updateUser(id: string, data: Partial<UserFormData>): Promise<User> {
    const response: ApiResponse = await api.put(`/users/${id}`, data);
    return response.data.user as User;
  }

  /**
   * Elimina um utilizador.
   */
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  /**
   * Aprova o registo de um correspondente.
   */
  async approveCorrespondent(id: string): Promise<User> {
    const response: ApiResponse = await api.patch(`/users/${id}/approve`);
    return response.data.user as User;
  }
}

// ✅ CORREÇÃO: Exporta a INSTÂNCIA, não a classe
const userService = UserService.getInstance();
export default userService;