import api from './api';
import { User } from '../types';

// Interface para a resposta da API de usuários
interface ApiResponse {
  success: boolean;
  data: {
    users?: User[];
    user?: User;
  };
  message?: string;
}

// Interfaces para tipagem (mantidas do arquivo original)
interface PlatformStats {
  totalDiligences: number;
  activeDiligences: number;
  completedDiligences: number;
  totalUsers: number;
  activeCorrespondents: number;
  totalRevenue: number;
  monthlyProfit: number;
  growthRate: number;
}

interface PlatformAnalytics {
  totalUsers: number;
  totalDiligences: number;
  completedDiligences: number;
  pendingDiligences: number;
  totalRevenue: number;
  averageRating: number;
  responseTime: number;
  conversionRate: number;
  userGrowth: number;
  revenueGrowth: number;
  satisfactionScore: number;
  activeUsers: number;
}

interface ClientStats {
  myDiligences: number;
  pendingDiligences: number;
  completedDiligences: number;
  totalSpent: number;
  averageResponseTime: number;
  satisfactionRate: number;
}

interface RecentDiligence {
  id: string;
  title: string;
  status: string;
  clientName?: string;
  correspondentName?: string;
  createdAt: string;
}

class PlatformService {
  // ========== MÉTODOS PARA USUÁRIOS (ADICIONADOS) ==========
  
  /**
   * Busca todos os clientes da plataforma.
   */
  async getClients(): Promise<User[]> {
    try {
      console.log('🔍 Carregando clientes...');
      const response: ApiResponse = await api.get('/users/clients');
      return response.data.users || [];
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }
  }

  /**
   * Busca todos os correspondentes da plataforma.
   */
  async getCorrespondents(): Promise<User[]> {
    try {
      console.log('🔍 Carregando correspondentes...');
      const response: ApiResponse = await api.get('/users/correspondents');
      return response.data.users || [];
    } catch (error) {
      console.error("Erro ao buscar correspondentes:", error);
      throw error;
    }
  }

  /**
   * Busca correspondentes pendentes de aprovação.
   */
  async getPendingCorrespondents(): Promise<User[]> {
    try {
      console.log('🔍 Carregando correspondentes pendentes...');
      const response: ApiResponse = await api.get('/users/correspondents/pending');
      return response.data.users || [];
    } catch (error) {
      console.error("Erro ao buscar correspondentes pendentes:", error);
      throw error;
    }
  }

  /**
   * Aprova um correspondente.
   */
  async approveCorrespondent(id: string): Promise<User> {
    try {
      console.log(`✅ Aprovando correspondente ${id}...`);
      const response: ApiResponse = await api.patch(`/users/correspondents/${id}/approve`);
      return response.data.user as User;
    } catch (error) {
      console.error(`Erro ao aprovar correspondente ${id}:`, error);
      throw error;
    }
  }

  /**
   * Rejeita um correspondente.
   */
  async rejectCorrespondent(id: string): Promise<User> {
    try {
      console.log(`❌ Rejeitando correspondente ${id}...`);
      const response: ApiResponse = await api.patch(`/users/correspondents/${id}/reject`);
      return response.data.user as User;
    } catch (error) {
      console.error(`Erro ao rejeitar correspondente ${id}:`, error);
      throw error;
    }
  }

  // ========== MÉTODOS ORIGINAIS DE ANALYTICS/STATS ==========

  // Função auxiliar para garantir que um valor seja um número válido
  private safeNumber(value: any, defaultValue: number = 0): number {
    if (value === undefined || value === null || isNaN(Number(value))) {
      return defaultValue;
    }
    return Number(value);
  }

  // Função auxiliar para gerar dados mockados realistas
  private generateMockAnalytics(): PlatformAnalytics {
    return {
      totalUsers: 89,
      totalDiligences: 156,
      completedDiligences: 142,
      pendingDiligences: 14,
      totalRevenue: 45000,
      averageRating: 4.7,
      responseTime: 18.5,
      conversionRate: 91.0,
      userGrowth: 15.3,
      revenueGrowth: 22.8,
      satisfactionScore: 4.6,
      activeUsers: 67
    };
  }

  private generateMockStats(): PlatformStats {
    return {
      totalDiligences: 156,
      activeDiligences: 23,
      completedDiligences: 133,
      totalUsers: 89,
      activeCorrespondents: 12,
      totalRevenue: 45000,
      monthlyProfit: 12500,
      growthRate: 15.3
    };
  }

  private generateMockClientStats(): ClientStats {
    return {
      myDiligences: 8,
      pendingDiligences: 2,
      completedDiligences: 6,
      totalSpent: 2400,
      averageResponseTime: 24,
      satisfactionRate: 4.8
    };
  }

  private generateMockRecentDiligences(): RecentDiligence[] {
    return [
      {
        id: '1',
        title: 'Diligência Comercial - Empresa ABC',
        status: 'completed',
        clientName: 'João Silva',
        correspondentName: 'Maria Santos',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Verificação de Endereço',
        status: 'in_progress',
        clientName: 'Ana Costa',
        correspondentName: 'Pedro Oliveira',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        title: 'Diligência Judicial',
        status: 'pending',
        clientName: 'Carlos Mendes',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  }

  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    try {
      console.log('🔍 Carregando analytics da plataforma...');
      
      // Verificar se api está disponível e tem o método get
      if (!api || typeof api.get !== 'function') {
        console.warn('⚠️ API não disponível, usando dados mockados');
        return this.generateMockAnalytics();
      }

      const response = await api.get('/platform/analytics');
      
      if (response && response.data) {
        // Validar e sanitizar dados da API
        const data = response.data;
        return {
          totalUsers: this.safeNumber(data.totalUsers, 89),
          totalDiligences: this.safeNumber(data.totalDiligences, 156),
          completedDiligences: this.safeNumber(data.completedDiligences, 142),
          pendingDiligences: this.safeNumber(data.pendingDiligences, 14),
          totalRevenue: this.safeNumber(data.totalRevenue, 45000),
          averageRating: this.safeNumber(data.averageRating, 4.7),
          responseTime: this.safeNumber(data.responseTime, 18.5),
          conversionRate: this.safeNumber(data.conversionRate, 91.0),
          userGrowth: this.safeNumber(data.userGrowth, 15.3),
          revenueGrowth: this.safeNumber(data.revenueGrowth, 22.8),
          satisfactionScore: this.safeNumber(data.satisfactionScore, 4.6),
          activeUsers: this.safeNumber(data.activeUsers, 67)
        };
      }
      
      throw new Error('Resposta da API inválida');
      
    } catch (error) {
      console.warn('⚠️ Erro ao carregar analytics da API:', error);
      console.log('📊 Usando dados mockados para demonstração');
      return this.generateMockAnalytics();
    }
  }

  async getPlatformStats(): Promise<PlatformStats> {
    try {
      console.log('🔍 Carregando stats da plataforma...');
      
      if (!api || typeof api.get !== 'function') {
        console.warn('⚠️ API não disponível, usando dados mockados');
        return this.generateMockStats();
      }

      const response = await api.get('/platform/stats');
      
      if (response && response.data) {
        const data = response.data;
        return {
          totalDiligences: this.safeNumber(data.totalDiligences, 156),
          activeDiligences: this.safeNumber(data.activeDiligences, 23),
          completedDiligences: this.safeNumber(data.completedDiligences, 133),
          totalUsers: this.safeNumber(data.totalUsers, 89),
          activeCorrespondents: this.safeNumber(data.activeCorrespondents, 12),
          totalRevenue: this.safeNumber(data.totalRevenue, 45000),
          monthlyProfit: this.safeNumber(data.monthlyProfit, 12500),
          growthRate: this.safeNumber(data.growthRate, 15.3)
        };
      }
      
      throw new Error('Resposta da API inválida');
      
    } catch (error) {
      console.warn('⚠️ Erro ao carregar stats da API:', error);
      console.log('📊 Usando dados mockados para demonstração');
      return this.generateMockStats();
    }
  }

  async getClientStats(userId: string): Promise<ClientStats> {
    try {
      console.log(`🔍 Carregando stats do cliente ${userId}...`);
      
      if (!api || typeof api.get !== 'function') {
        console.warn('⚠️ API não disponível, usando dados mockados');
        return this.generateMockClientStats();
      }

      const response = await api.get(`/clients/${userId}/stats`);
      
      if (response && response.data) {
        const data = response.data;
        return {
          myDiligences: this.safeNumber(data.myDiligences, 8),
          pendingDiligences: this.safeNumber(data.pendingDiligences, 2),
          completedDiligences: this.safeNumber(data.completedDiligences, 6),
          totalSpent: this.safeNumber(data.totalSpent, 2400),
          averageResponseTime: this.safeNumber(data.averageResponseTime, 24),
          satisfactionRate: this.safeNumber(data.satisfactionRate, 4.8)
        };
      }
      
      throw new Error('Resposta da API inválida');
      
    } catch (error) {
      console.warn('⚠️ Erro ao carregar stats do cliente da API:', error);
      console.log('📊 Usando dados mockados para demonstração');
      return this.generateMockClientStats();
    }
  }

  async getRecentDiligences(): Promise<RecentDiligence[]> {
    try {
      console.log('🔍 Carregando diligências recentes...');
      
      if (!api || typeof api.get !== 'function') {
        console.warn('⚠️ API não disponível, usando dados mockados');
        return this.generateMockRecentDiligences();
      }

      const response = await api.get('/diligences/recent');
      
      if (response && response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title || 'Sem título',
          status: item.status || 'pending',
          clientName: item.clientName || 'Cliente não informado',
          correspondentName: item.correspondentName || 'Não atribuído',
          createdAt: item.createdAt || new Date().toISOString()
        }));
      }
      
      throw new Error('Resposta da API inválida');
      
    } catch (error) {
      console.warn('⚠️ Erro ao carregar diligências recentes da API:', error);
      console.log('📊 Usando dados mockados para demonstração');
      return this.generateMockRecentDiligences();
    }
  }

  async getClientRecentDiligences(userId: string): Promise<RecentDiligence[]> {
    try {
      console.log(`🔍 Carregando diligências recentes do cliente ${userId}...`);
      
      if (!api || typeof api.get !== 'function') {
        console.warn('⚠️ API não disponível, usando dados mockados');
        return this.generateMockRecentDiligences();
      }

      const response = await api.get(`/clients/${userId}/diligences/recent`);
      
      if (response && response.data && Array.isArray(response.data)) {
        return response.data.map((item: any) => ({
          id: item.id || Math.random().toString(),
          title: item.title || 'Sem título',
          status: item.status || 'pending',
          correspondentName: item.correspondentName || 'Não atribuído',
          createdAt: item.createdAt || new Date().toISOString()
        }));
      }
      
      throw new Error('Resposta da API inválida');
      
    } catch (error) {
      console.warn('⚠️ Erro ao carregar diligências do cliente da API:', error);
      console.log('📊 Usando dados mockados para demonstração');
      return this.generateMockRecentDiligences();
    }
  }

  async getOperationalReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      console.log('🔍 Carregando relatório operacional...');
      
      if (!api || typeof api.get !== 'function') {
        console.warn('⚠️ API não disponível, usando dados mockados');
        return {
          totalDiligences: 156,
          completedDiligences: 142,
          topCorrespondents: [
            { id: '1', name: 'Maria Santos', completedDiligences: 23, revenue: 6900, rating: 4.8 },
            { id: '2', name: 'João Silva', completedDiligences: 19, revenue: 5700, rating: 4.6 }
          ],
          topClients: [
            { id: '1', name: 'Empresa ABC Ltda', totalSpent: 8500, diligencesCount: 12 },
            { id: '2', name: 'Consultoria XYZ', totalSpent: 6200, diligencesCount: 8 }
          ]
        };
      }

      const response = await api.get('/reports/operational', {
        params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
      });
      
      return response.data || {};
      
    } catch (error) {
      console.warn('⚠️ Erro ao carregar relatório operacional:', error);
      return {
        totalDiligences: 156,
        completedDiligences: 142,
        topCorrespondents: [],
        topClients: []
      };
    }
  }

  async getPerformanceReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      console.log('🔍 Carregando relatório de performance...');
      
      if (!api || typeof api.get !== 'function') {
        console.warn('⚠️ API não disponível, usando dados mockados');
        return {
          averageResponseTime: 18.5,
          completionRate: 91.0,
          clientSatisfaction: 4.7,
          correspondentUtilization: 78.5
        };
      }

      const response = await api.get('/reports/performance', {
        params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
      });
      
      return response.data || {};
      
    } catch (error) {
      console.warn('⚠️ Erro ao carregar relatório de performance:', error);
      return {
        averageResponseTime: 18.5,
        completionRate: 91.0,
        clientSatisfaction: 4.7,
        correspondentUtilization: 78.5
      };
    }
  }
}

// ✅ Exporta a instância, não a classe
const platformService = new PlatformService();
export default platformService;