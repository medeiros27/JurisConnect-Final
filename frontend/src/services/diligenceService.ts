import api from './api'; // Importa o nosso cliente de API centralizado
import { Diligence } from '../types';
import { DiligenceFormData } from '../components/Forms/DiligenceForm';

// O serviço agora atua como uma camada fina para fazer chamadas HTTP.
class DiligenceService {
  private static instance: DiligenceService;

  private constructor() {
    // O construtor está vazio. Não há mais necessidade de carregar dados locais.
  }

  public static getInstance(): DiligenceService {
    if (!DiligenceService.instance) {
      DiligenceService.instance = new DiligenceService();
    }
    return DiligenceService.instance;
  }

  /**
   * Busca todas as diligências da API.
   * @returns Uma promessa com a lista de diligências.
   */
  async getDiligences(): Promise<Diligence[]> {
    return api.get('/diligences');
  }

  /**
   * Busca uma única diligência pelo seu ID.
   * @param id - O ID da diligência.
   * @returns Uma promessa com os dados da diligência ou null se não encontrada.
   */
  async getDiligenceById(id: string): Promise<Diligence | null> {
    return api.get(`/diligences/${id}`);
  }

  /**
   * Cria uma nova diligência no backend.
   * O backend será responsável por criar dados financeiros e notificações associadas.
   * @param data - Os dados do formulário de criação.
   * @returns Uma promessa com a nova diligência criada.
   */
  async createDiligence(data: DiligenceFormData): Promise<Diligence> {
    // Para uploads de ficheiros, usamos FormData.
    const formData = new FormData();
    
    // Adiciona todos os campos de texto/numéricos ao formData
    Object.keys(data).forEach(key => {
      const value = data[key as keyof DiligenceFormData];
      if (key !== 'attachments') {
        formData.append(key, String(value));
      }
    });

    // Adiciona os ficheiros de anexo
    data.attachments.forEach(file => {
      formData.append('attachments', file);
    });

    return api.post('/diligences', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Atualiza uma diligência existente.
   * @param id - O ID da diligência a ser atualizada.
   * @param data - Os dados a serem atualizados.
   * @returns Uma promessa com a diligência atualizada.
   */
  async updateDiligence(id: string, data: Partial<DiligenceFormData>): Promise<Diligence> {
    // A lógica de upload de novos ficheiros também usaria FormData aqui.
    return api.put(`/diligences/${id}`, data);
  }

  /**
   * Elimina uma diligência.
   * @param id - O ID da diligência a ser eliminada.
   */
  async deleteDiligence(id: string): Promise<void> {
    return api.delete(`/diligences/${id}`);
  }

  /**
   * Atualiza o estado de uma diligência.
   * @param id - O ID da diligência.
   * @param status - O novo estado.
   * @returns Uma promessa com a diligência atualizada.
   */
  async updateDiligenceStatus(id: string, status: Diligence['status']): Promise<Diligence> {
    return api.put(`/diligences/${id}/status`, { status });
  }

  /**
   * Atribui uma diligência a um correspondente.
   * @param diligenceId - O ID da diligência.
   * @param correspondentId - O ID do correspondente.
   * @returns Uma promessa com a diligência atualizada.
   */
  async assignDiligence(diligenceId: string, correspondentId: string): Promise<Diligence> {
    return api.put(`/diligences/${diligenceId}/assign`, { correspondentId });
  }

  /**
   * Aceita uma diligência (para correspondentes).
   * @param diligenceId - O ID da diligência.
   * @returns Uma promessa com a diligência atualizada.
   */
  async acceptDiligence(diligenceId: string): Promise<Diligence> {
    return api.put(`/diligences/${diligenceId}/accept`);
  }

  /**
   * Inicia uma diligência (para correspondentes).
   * @param diligenceId - O ID da diligência.
   * @returns Uma promessa com a diligência atualizada.
   */
  async startDiligence(diligenceId: string): Promise<Diligence> {
    return api.put(`/diligences/${diligenceId}/start`);
  }

  /**
   * Completa uma diligência (para correspondentes).
   * @param diligenceId - O ID da diligência.
   * @returns Uma promessa com a diligência atualizada.
   */
  async completeDiligence(diligenceId: string): Promise<Diligence> {
    return api.put(`/diligences/${diligenceId}/complete`);
  }
  
  /**
   * Reverte o estado de uma diligência para o estado anterior.
   * @param diligenceId - O ID da diligência.
   * @param targetStatus - Estado alvo (opcional).
   * @param reason - Motivo da reversão.
   * @returns Uma promessa com a diligência atualizada.
   */
  async revertDiligenceStatus(diligenceId: string, targetStatus?: string, reason?: string): Promise<Diligence> {
    return api.put(`/diligences/${diligenceId}/revert-status`, { targetStatus, reason });
  }

  /**
   * Busca diligências por cliente.
   * @param clientId - O ID do cliente.
   * @returns Uma promessa com a lista de diligências.
   */
  async getDiligencesByClient(clientId: string): Promise<Diligence[]> {
    return api.get(`/diligences/client/${clientId}`);
  }

  /**
   * Busca diligências por correspondente.
   * @param correspondentId - O ID do correspondente.
   * @returns Uma promessa com a lista de diligências.
   */
  async getDiligencesByCorrespondent(correspondentId: string): Promise<Diligence[]> {
    return api.get(`/diligences/correspondent/${correspondentId}`);
  }

  /**
   * Busca diligências disponíveis para correspondentes.
   * @param state - Estado (opcional).
   * @param city - Cidade (opcional).
   * @returns Uma promessa com a lista de diligências.
   */
  async getAvailableDiligences(state?: string, city?: string): Promise<Diligence[]> {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (city) params.append('city', city);
    
    return api.get(`/diligences/available?${params.toString()}`);
  }

  /**
   * Busca histórico de status de uma diligência.
   * @param diligenceId - O ID da diligência.
   * @returns Uma promessa com o histórico de status.
   */
  async getDiligenceStatusHistory(diligenceId: string): Promise<any[]> {
    return api.get(`/diligences/${diligenceId}/history`);
  }

  /**
   * Submete um comprovativo de pagamento para uma diligência.
   * @param diligenceId - O ID da diligência.
   * @param pixKey - Chave PIX.
   * @param proofImage - Imagem do comprovativo.
   * @param amount - Valor do pagamento.
   * @param userId - ID do usuário.
   * @returns Uma promessa com a diligência atualizada.
   */
  async submitPaymentProof(diligenceId: string, pixKey: string, proofImage: File, amount: number, userId: string): Promise<Diligence> {
    const formData = new FormData();
    formData.append('pixKey', pixKey);
    formData.append('proofImage', proofImage);
    formData.append('amount', amount.toString());

    return api.post(`/financial/proof/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Verifica (aprova ou rejeita) um comprovativo de pagamento.
   * @param proofId - O ID do comprovativo.
   * @param isApproved - Booleano indicando se o comprovativo foi aprovado.
   * @param rejectionReason - Motivo da rejeição (opcional).
   * @returns Uma promessa com o resultado da verificação.
   */
  async verifyPaymentProof(proofId: string, isApproved: boolean, rejectionReason?: string): Promise<any> {
    return api.post(`/financial/proof/${proofId}/verify`, { 
      isApproved, 
      rejectionReason 
    });
  }
}

export default DiligenceService.getInstance();

