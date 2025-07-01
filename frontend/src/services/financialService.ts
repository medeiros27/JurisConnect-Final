import api from './api';
import { FinancialSummary, DiligenceFinancialData, Payment } from '../types';

class FinancialService {
  private static instance: FinancialService;

  public static getInstance(): FinancialService {
    if (!FinancialService.instance) {
      FinancialService.instance = new FinancialService();
    }
    return FinancialService.instance;
  }

  /**
   * Busca o resumo financeiro geral da API.
   */
  async getFinancialSummary(): Promise<FinancialSummary> {
    return api.get('/financial/summary');
  }

  /**
   * Busca todos os registos financeiros da API.
   */
  async getAllFinancialData(): Promise<DiligenceFinancialData[]> {
    return api.get('/financial');
  }

  /**
   * Busca os dados financeiros de uma diligência específica.
   */
  async getFinancialDataByDiligence(diligenceId: string): Promise<DiligenceFinancialData | null> {
    return api.get(`/financial/diligence/${diligenceId}`);
  }

  /**
   * Envia comprovante de pagamento.
   */
  async submitPaymentProof(diligenceId: string, pixKey: string, proofImage: string, amount: number, userId: string): Promise<any> {
    return api.post('/financial/proof/upload', {
      diligenceId,
      pixKey,
      proofImage,
      amount
    });
  }

  /**
   * Busca comprovante de pagamento por diligência.
   */
  async getPaymentProofByDiligenceId(diligenceId: string): Promise<any> {
    return api.get(`/financial/proof/diligence/${diligenceId}`);
  }

  /**
   * Verifica comprovante de pagamento.
   */
  async verifyPaymentProof(proofId: string, isApproved: boolean, adminId: string, rejectionReason?: string): Promise<any> {
    return api.post(`/financial/proof/${proofId}/verify`, {
      isApproved,
      rejectionReason
    });
  }

  /**
   * Busca pagamentos do correspondente.
   */
  async getCorrespondentPayments(correspondentId: string): Promise<Payment[]> {
    return api.get('/financial/correspondent/payments');
  }

  /**
   * Atualiza status de pagamento (correspondente).
   */
  async updatePaymentStatusByCorrespondent(paymentId: string, status: string): Promise<Payment> {
    return api.put(`/financial/correspondent/payments/${paymentId}/status`, { status });
  }

  /**
   * Busca todos os pagamentos (admin).
   */
  async getAllPayments(): Promise<Payment[]> {
    return api.get('/financial/admin/payments');
  }

  /**
   * Atualiza status de pagamento (admin).
   */
  async updatePaymentStatusByAdmin(paymentId: string, status: string): Promise<Payment> {
    return api.put(`/financial/admin/payments/${paymentId}/status`, { status });
  }

  /**
   * Marca o pagamento de um cliente como pago.
   */
  async markClientPaymentAsPaid(diligenceId: string): Promise<void> {
    return api.post(`/financial/diligence/${diligenceId}/pay-client`);
  }

  /**
   * Marca o pagamento de um correspondente como pago.
   */
  async markCorrespondentPaymentAsPaid(diligenceId: string): Promise<void> {
    return api.post(`/financial/diligence/${diligenceId}/pay-correspondent`);
  }
}

export default FinancialService.getInstance();

