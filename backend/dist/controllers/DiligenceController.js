"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiligenceController = void 0;
const DiligenceRepository_1 = require("../repositories/DiligenceRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const StatusHistoryRepository_1 = require("../repositories/StatusHistoryRepository");
const errorHandler_1 = require("../middlewares/errorHandler");
const ALLOWED_DILIGENCE_STATUSES = ["pending", "assigned", "in_progress", "completed", "cancelled", "disputed"];
class DiligenceController {
    constructor() {
        this.getAllDiligences = async (req, res) => {
            const diligenceRepository = this.getDiligenceRepository();
            const diligences = await diligenceRepository.findAll();
            return res.json(diligences);
        };
        this.getDiligenceById = async (req, res) => {
            const { id } = req.params;
            const diligenceRepository = this.getDiligenceRepository();
            const diligence = await diligenceRepository.findById(id);
            if (!diligence) {
                throw new errorHandler_1.AppError("Diligência não encontrada", 404);
            }
            return res.json(diligence);
        };
        this.createDiligence = async (req, res) => {
            const userId = req.user?.id;
            const diligenceData = req.body;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const diligenceRepository = this.getDiligenceRepository();
            // Adicionar o ID do cliente à diligência
            const newDiligence = await diligenceRepository.createDiligence({
                ...diligenceData,
                clientId: userId,
                status: "pending",
                createdAt: new Date(),
            });
            return res.status(201).json(newDiligence);
        };
        this.updateDiligence = async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;
            const diligenceRepository = this.getDiligenceRepository();
            const updatedDiligence = await diligenceRepository.updateDiligence(id, updateData);
            return res.json(updatedDiligence);
        };
        this.deleteDiligence = async (req, res) => {
            const { id } = req.params;
            const diligenceRepository = this.getDiligenceRepository();
            await diligenceRepository.deleteDiligence(id);
            return res.status(204).send();
        };
        this.getMyDiligences = async (req, res) => {
            const userId = req.user?.id;
            const userRole = req.user?.role;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const diligenceRepository = this.getDiligenceRepository();
            let diligences;
            if (userRole === "client") {
                diligences = await diligenceRepository.findByClient(userId);
            }
            else if (userRole === "correspondent") {
                diligences = await diligenceRepository.findByCorrespondent(userId);
            }
            else {
                throw new errorHandler_1.AppError("Tipo de usuário não autorizado", 403);
            }
            return res.json(diligences);
        };
        this.getAvailableDiligences = async (req, res) => {
            const { state, city } = req.query;
            const diligenceRepository = this.getDiligenceRepository();
            const diligences = await diligenceRepository.findAvailableDiligences(state, city);
            return res.json(diligences);
        };
        this.assignDiligence = async (req, res) => {
            const { id } = req.params;
            const { correspondentId } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const diligenceRepository = this.getDiligenceRepository();
            const userRepository = this.getUserRepository();
            // Verificar se a diligência existe
            const diligence = await diligenceRepository.findById(id);
            if (!diligence) {
                throw new errorHandler_1.AppError("Diligência não encontrada", 404);
            }
            // Verificar se o correspondente existe
            const correspondent = await userRepository.findOneBy({ id: correspondentId });
            if (!correspondent || correspondent.role !== "correspondent") {
                throw new errorHandler_1.AppError("Correspondente não encontrado", 404);
            }
            // Atualizar a diligência
            const updatedDiligence = await diligenceRepository.updateDiligence(id, {
                correspondentId,
                status: "assigned",
            });
            // Registrar no histórico
            const statusHistoryRepository = this.getStatusHistoryRepository();
            await statusHistoryRepository.createStatusHistory({
                diligenceId: id,
                entityType: "diligence",
                previousStatus: diligence.status,
                newStatus: "assigned",
                userId,
                timestamp: new Date(),
                reason: `Diligência atribuída ao correspondente ${correspondent.name}`,
            });
            return res.json(updatedDiligence);
        };
        this.acceptDiligence = async (req, res) => {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const diligenceRepository = this.getDiligenceRepository();
            const diligence = await diligenceRepository.findById(id);
            if (!diligence) {
                throw new errorHandler_1.AppError("Diligência não encontrada", 404);
            }
            if (diligence.correspondentId !== userId) {
                throw new errorHandler_1.AppError("Você não está autorizado a aceitar esta diligência", 403);
            }
            const updatedDiligence = await diligenceRepository.updateDiligence(id, {
                status: "in_progress",
            });
            // Registrar no histórico
            const statusHistoryRepository = this.getStatusHistoryRepository();
            await statusHistoryRepository.createStatusHistory({
                diligenceId: id,
                entityType: "diligence",
                previousStatus: diligence.status,
                newStatus: "in_progress",
                userId,
                timestamp: new Date(),
                reason: "Diligência aceita pelo correspondente",
            });
            return res.json(updatedDiligence);
        };
        this.startDiligence = async (req, res) => {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const diligenceRepository = this.getDiligenceRepository();
            const diligence = await diligenceRepository.findById(id);
            if (!diligence) {
                throw new errorHandler_1.AppError("Diligência não encontrada", 404);
            }
            if (diligence.correspondentId !== userId) {
                throw new errorHandler_1.AppError("Você não está autorizado a iniciar esta diligência", 403);
            }
            const updatedDiligence = await diligenceRepository.updateDiligence(id, {
                status: "in_progress",
            });
            // Registrar no histórico
            const statusHistoryRepository = this.getStatusHistoryRepository();
            await statusHistoryRepository.createStatusHistory({
                diligenceId: id,
                entityType: "diligence",
                previousStatus: diligence.status,
                newStatus: "in_progress",
                userId,
                timestamp: new Date(),
                reason: "Diligência iniciada",
            });
            return res.json(updatedDiligence);
        };
        this.completeDiligence = async (req, res) => {
            const { id } = req.params;
            const { notes } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const diligenceRepository = this.getDiligenceRepository();
            const diligence = await diligenceRepository.findById(id);
            if (!diligence) {
                throw new errorHandler_1.AppError("Diligência não encontrada", 404);
            }
            if (diligence.correspondentId !== userId) {
                throw new errorHandler_1.AppError("Você não está autorizado a completar esta diligência", 403);
            }
            const updatedDiligence = await diligenceRepository.updateDiligence(id, {
                status: "completed",
            });
            // Registrar no histórico
            const statusHistoryRepository = this.getStatusHistoryRepository();
            await statusHistoryRepository.createStatusHistory({
                diligenceId: id,
                entityType: "diligence",
                previousStatus: diligence.status,
                newStatus: "completed",
                userId,
                timestamp: new Date(),
                reason: notes || "Diligência concluída",
            });
            return res.json(updatedDiligence);
        };
        this.updateStatus = async (req, res) => {
            const { id } = req.params;
            const { status, notes } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            if (!ALLOWED_DILIGENCE_STATUSES.includes(status)) {
                throw new errorHandler_1.AppError("Status inválido", 400);
            }
            const diligenceRepository = this.getDiligenceRepository();
            const diligence = await diligenceRepository.findById(id);
            if (!diligence) {
                throw new errorHandler_1.AppError("Diligência não encontrada", 404);
            }
            const updatedDiligence = await diligenceRepository.updateDiligence(id, { status });
            // Registrar no histórico
            const statusHistoryRepository = this.getStatusHistoryRepository();
            await statusHistoryRepository.createStatusHistory({
                diligenceId: id,
                entityType: "diligence",
                previousStatus: diligence.status,
                newStatus: status,
                userId,
                timestamp: new Date(),
                reason: notes || `Status alterado para ${status}`,
            });
            return res.json(updatedDiligence);
        };
        this.getStatusHistory = async (req, res) => {
            const { id } = req.params;
            const statusHistoryRepository = this.getStatusHistoryRepository();
            const history = await statusHistoryRepository.findByDiligenceId(id);
            return res.json(history);
        };
    }
    // Remover instanciação no construtor e usar lazy loading
    getDiligenceRepository() {
        const repository = DiligenceRepository_1.DiligenceRepository.getSafeRepository();
        if (!repository) {
            throw new errorHandler_1.AppError("Banco de dados não disponível", 500);
        }
        return repository;
    }
    getUserRepository() {
        const repository = UserRepository_1.UserRepository.getSafeRepository();
        if (!repository) {
            throw new errorHandler_1.AppError("Banco de dados não disponível", 500);
        }
        return repository;
    }
    getStatusHistoryRepository() {
        const repository = StatusHistoryRepository_1.StatusHistoryRepository.getSafeRepository();
        if (!repository) {
            throw new errorHandler_1.AppError("Banco de dados não disponível", 500);
        }
        return repository;
    }
}
exports.DiligenceController = DiligenceController;
//# sourceMappingURL=DiligenceController.js.map