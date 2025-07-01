"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialController = void 0;
const errorHandler_1 = require("../middlewares/errorHandler");
/**
 * O FinancialController lida com as requisições HTTP para a rota /financial.
 */
class FinancialController {
    /**
     * Upload de comprovante de pagamento pelo cliente
     */
    async uploadPaymentProof(req, res) {
        try {
            const { diligenceId } = req.body;
            const userId = req.user?.id;
            if (!req.file) {
                throw new errorHandler_1.AppError('Arquivo não enviado', 400);
            }
            if (!userId) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const result = {
                id: `proof_${Date.now()}`,
                diligenceId,
                userId,
                filename: req.file.filename,
                originalName: req.file.originalname,
                uploadedAt: new Date().toISOString()
            };
            res.status(200).json({
                success: true,
                message: 'Comprovante enviado com sucesso',
                data: result
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }
    async getPaymentProofByDiligenceId(req, res) {
        try {
            const { diligenceId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const proof = {
                id: `proof_${diligenceId}`,
                diligenceId,
                filename: 'comprovante.pdf',
                uploadedAt: new Date().toISOString(),
                status: 'uploaded'
            };
            res.status(200).json({
                success: true,
                data: proof
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }
    async getCorrespondentPayments(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const payments = [
                {
                    id: '1',
                    diligenceId: 'dil_001',
                    amount: 150.00,
                    status: 'pending',
                    dueDate: '2024-01-15',
                    description: 'Pagamento por diligência realizada'
                }
            ];
            res.status(200).json({
                success: true,
                data: payments
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }
    async updatePaymentStatusByCorrespondent(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const result = {
                id,
                status,
                updatedAt: new Date().toISOString(),
                updatedBy: userId
            };
            res.status(200).json({
                success: true,
                message: 'Status atualizado com sucesso',
                data: result
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }
    async getFinancialSummary(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const summary = {
                totalReceived: 1500.00,
                totalPending: 300.00,
                totalDue: 200.00,
                monthlyRevenue: 800.00
            };
            res.status(200).json({
                success: true,
                data: summary
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }
    async processPayment(req, res) {
        try {
            const { paymentId, action } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const result = {
                paymentId,
                action,
                status: 'processed',
                processedAt: new Date().toISOString(),
                processedBy: userId
            };
            res.status(200).json({
                success: true,
                message: 'Pagamento processado com sucesso',
                data: result
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }
    async getAllPayments(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const payments = [
                {
                    id: '1',
                    clientId: 'client_1',
                    correspondentId: 'corresp_1',
                    amount: 150.00,
                    status: 'pending',
                    createdAt: '2024-01-01'
                }
            ];
            res.status(200).json({
                success: true,
                data: payments
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }
    async updatePaymentStatusByAdmin(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError('Usuário não autenticado', 401);
            }
            const result = {
                id,
                status,
                notes,
                updatedAt: new Date().toISOString(),
                updatedBy: userId
            };
            res.status(200).json({
                success: true,
                message: 'Status atualizado pelo admin',
                data: result
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Erro interno do servidor'
            });
        }
    }
}
exports.FinancialController = FinancialController;
//# sourceMappingURL=FinancialController.js.map