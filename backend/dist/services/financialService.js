"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FinancialRepository_1 = require("../repositories/FinancialRepository");
const errorHandler_1 = require("../middlewares/errorHandler");
class FinancialService {
    constructor() {
        this.financialRepository = new FinancialRepository_1.FinancialRepository();
    }
    // SOLUÇÃO: Adicionar o método que estava em falta
    async createFinancialDataForDiligence(diligence, correspondentValue) {
        // Cria o registo de pagamento para o cliente
        await this.financialRepository.createPayment({
            diligenceId: diligence.id,
            clientId: diligence.clientId,
            amount: diligence.value,
            type: 'client_payment',
            status: 'pending'
        });
        // Se um correspondente foi atribuído, cria o registo de pagamento para ele
        if (diligence.correspondentId) {
            await this.financialRepository.createPayment({
                diligenceId: diligence.id,
                correspondentId: diligence.correspondentId,
                amount: correspondentValue,
                type: 'correspondent_payment',
                status: 'pending'
            });
        }
    }
    async getFinancialSummary() {
        // A implementação real dependeria de queries complexas. Mantendo simulação por agora.
        return { totalFaturado: 0, totalLucro: 0, totalCusto: 0 };
    }
    async getAllFinancialData() {
        return this.financialRepository.findAllPayments();
    }
    async getFinancialDataByDiligence(diligenceId) {
        return this.financialRepository.findPaymentsByDiligence(diligenceId);
    }
    async submitPaymentProof(diligenceId, pixKey, proofImage, amount, userId) {
        return this.financialRepository.createPaymentProof({
            diligenceId,
            pixKey,
            proofImage,
            amount,
            uploadedById: userId,
            type: 'client_payment',
            status: 'pending_verification'
        });
    }
    async verifyPaymentProof(proofId, isApproved, adminId, rejectionReason) {
        const proof = await this.financialRepository.findPaymentProofById(proofId);
        if (!proof) {
            throw new errorHandler_1.AppError("Comprovativo de pagamento não encontrado", 404);
        }
        const status = isApproved ? 'verified' : 'rejected';
        return this.financialRepository.updatePaymentProof(proofId, {
            status,
            verifiedById: adminId,
            verifiedAt: new Date(),
            rejectionReason: isApproved ? undefined : rejectionReason
        });
    }
    async markClientPaymentAsPaid(diligenceId, userId) {
        const payments = await this.financialRepository.findPaymentsByDiligence(diligenceId);
        const clientPayment = payments.find(p => p.type === 'client_payment');
        if (!clientPayment)
            throw new errorHandler_1.AppError('Pagamento do cliente não encontrado', 404);
        return this.financialRepository.updatePayment(clientPayment.id, { status: 'completed', paidDate: new Date() });
    }
    async markCorrespondentPaymentAsPaid(diligenceId, userId) {
        const payments = await this.financialRepository.findPaymentsByDiligence(diligenceId);
        const correspondentPayment = payments.find(p => p.type === 'correspondent_payment');
        if (!correspondentPayment)
            throw new errorHandler_1.AppError('Pagamento do correspondente não encontrado', 404);
        return this.financialRepository.updatePayment(correspondentPayment.id, { status: 'completed', paidDate: new Date() });
    }
    async getClientFinancialData(clientId) {
        return this.financialRepository.findPaymentsByClient(clientId);
    }
    async getCorrespondentFinancialData(correspondentId) {
        return this.financialRepository.findPaymentsByCorrespondent(correspondentId);
    }
}
exports.default = new FinancialService();
//# sourceMappingURL=financialService.js.map