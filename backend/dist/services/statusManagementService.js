"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DiligenceRepository_1 = require("../repositories/DiligenceRepository");
const PaymentRepository_1 = require("../repositories/PaymentRepository");
const StatusHistoryRepository_1 = require("../repositories/StatusHistoryRepository");
const errorHandler_1 = require("../middlewares/errorHandler");
class StatusManagementService {
    constructor() {
        this.diligenceRepository = new DiligenceRepository_1.DiligenceRepository();
        this.paymentRepository = new PaymentRepository_1.PaymentRepository();
        this.statusHistoryRepository = new StatusHistoryRepository_1.StatusHistoryRepository();
    }
    async addStatusHistory(data) {
        const statusHistory = await this.statusHistoryRepository.createStatusHistory({
            diligenceId: data.diligenceId,
            paymentId: data.paymentId,
            entityType: data.entityType,
            previousStatus: data.previousStatus,
            newStatus: data.newStatus,
            userId: data.userId,
            reason: data.reason,
        });
        return statusHistory;
    }
    async updateDiligenceStatus(diligenceId, targetStatus, userId, reason) {
        const diligence = await this.diligenceRepository.findById(diligenceId);
        if (!diligence) {
            throw new errorHandler_1.AppError("Diligência não encontrada", 404);
        }
        const newStatus = targetStatus;
        await this.diligenceRepository.updateDiligence(diligenceId, { status: newStatus });
        await this.addStatusHistory({
            diligenceId: diligenceId,
            entityType: "diligence",
            previousStatus: diligence.status,
            newStatus: newStatus,
            userId: userId,
            reason: reason || `Status atualizado para ${newStatus}`,
        });
        const updatedDiligence = await this.diligenceRepository.findById(diligenceId);
        if (!updatedDiligence) {
            throw new errorHandler_1.AppError("Erro ao buscar diligência atualizada", 500);
        }
        return updatedDiligence;
    }
    async updatePaymentStatus(paymentId, targetStatus, userId, reason) {
        const payment = await this.paymentRepository.findById(paymentId);
        if (!payment) {
            throw new errorHandler_1.AppError("Pagamento não encontrado", 404);
        }
        const newStatus = targetStatus;
        await this.paymentRepository.update(paymentId, { status: newStatus });
        await this.addStatusHistory({
            paymentId: paymentId,
            entityType: "payment",
            previousStatus: payment.status,
            newStatus: newStatus,
            userId: userId,
            reason: reason || `Status atualizado para ${newStatus}`,
        });
        const updatedPayment = await this.paymentRepository.findById(paymentId);
        if (!updatedPayment) {
            throw new errorHandler_1.AppError("Erro ao buscar pagamento atualizado", 500);
        }
        return updatedPayment;
    }
    async canRevertStatus(entityId, entityType, userRole, userId, paymentType) {
        // Implementação simplificada - apenas admins podem reverter status
        if (userRole === 'admin') {
            return { canRevert: true };
        }
        // Para outros usuários, verificar se é o proprietário da entidade
        if (entityType === 'diligence') {
            const diligence = await this.diligenceRepository.findById(entityId);
            if (!diligence) {
                return { canRevert: false, reason: 'Diligência não encontrada' };
            }
            // Cliente pode reverter suas próprias diligências
            if (userRole === 'client' && diligence.clientId === userId) {
                return { canRevert: true };
            }
            // Correspondente pode reverter diligências atribuídas a ele
            if (userRole === 'correspondent' && diligence.correspondentId === userId) {
                return { canRevert: true };
            }
        }
        return { canRevert: false, reason: 'Permissão negada' };
    }
    async revertStatus(entityId, entityType, targetStatus, userId, reason, paymentType) {
        if (entityType === 'diligence') {
            const diligence = await this.diligenceRepository.findById(entityId);
            if (!diligence)
                throw new errorHandler_1.AppError('Diligência não encontrada', 404);
            await this.statusHistoryRepository.createStatusHistory({
                diligenceId: entityId,
                entityType,
                previousStatus: diligence.status,
                newStatus: targetStatus || "reverted",
                userId,
                reason
            });
            await this.diligenceRepository.updateDiligence(entityId, {
                status: (targetStatus || "pending")
            });
        }
        else if (entityType === 'payment') {
            const payment = await this.paymentRepository.findById(entityId);
            if (!payment)
                throw new errorHandler_1.AppError('Pagamento não encontrado', 404);
            await this.statusHistoryRepository.createStatusHistory({
                paymentId: entityId,
                entityType,
                previousStatus: payment.status,
                newStatus: targetStatus || "reverted",
                userId,
                reason
            });
            await this.paymentRepository.update(entityId, {
                status: (targetStatus || "pending")
            });
        }
    }
}
exports.default = new StatusManagementService();
//# sourceMappingURL=statusManagementService.js.map