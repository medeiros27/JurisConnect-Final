"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusManagementController = void 0;
// CORREÇÃO: Importar o serviço com nome correto (minúsculo)
const statusManagementService_1 = __importDefault(require("../services/statusManagementService"));
const StatusHistoryRepository_1 = require("../repositories/StatusHistoryRepository");
const errorHandler_1 = require("../middlewares/errorHandler");
class StatusManagementController {
    constructor() {
        this.canRevertStatus = async (req, res) => {
            const authRequest = req;
            const { entityId, entityType, paymentType } = req.query;
            const userId = authRequest.user?.id;
            const userRole = authRequest.user?.role;
            if (!userId || !userRole) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            if (!entityId || !entityType) {
                throw new errorHandler_1.AppError("Parâmetros obrigatórios não fornecidos", 400);
            }
            const result = await statusManagementService_1.default.canRevertStatus(entityId, entityType, userRole, userId, paymentType);
            return res.json(result);
        };
        this.revertStatus = async (req, res) => {
            const authRequest = req;
            const { entityId, entityType, targetStatus, reason, paymentType } = req.body;
            const userId = authRequest.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            if (!entityId || !entityType || !reason) {
                throw new errorHandler_1.AppError("Parâmetros obrigatórios não fornecidos", 400);
            }
            if (entityType === 'payment' && !paymentType) {
                throw new errorHandler_1.AppError("Tipo de pagamento é obrigatório para reversão de pagamentos", 400);
            }
            const result = await statusManagementService_1.default.revertStatus(entityId, entityType, targetStatus, userId, reason, paymentType);
            return res.json(result);
        };
        this.getDiligenceStatusHistory = async (req, res) => {
            const { id } = req.params;
            const statusHistory = await this.statusHistoryRepository.findByDiligenceId(id);
            // Filtrar apenas histórico de diligências
            const diligenceHistory = statusHistory.filter((history) => history.entityType === "diligence");
            return res.json(diligenceHistory);
        };
        this.getPaymentStatusHistory = async (req, res) => {
            const { id } = req.params;
            const statusHistory = await this.statusHistoryRepository.findByDiligenceId(id);
            // Filtrar apenas histórico de pagamentos
            const paymentHistory = statusHistory.filter((history) => history.entityType === "payment");
            return res.json(paymentHistory);
        };
        this.getAllStatusHistory = async (req, res) => {
            const statusHistory = await this.statusHistoryRepository.findAll();
            return res.json(statusHistory);
        };
        this.statusHistoryRepository = new StatusHistoryRepository_1.StatusHistoryRepository();
    }
}
exports.StatusManagementController = StatusManagementController;
//# sourceMappingURL=StatusManagementController.js.map