"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DiligenceRepository_1 = require("../repositories/DiligenceRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const errorHandler_1 = require("../middlewares/errorHandler");
const NotificationService_1 = __importDefault(require("./NotificationService"));
class DiligenceService {
    constructor() {
        this.diligenceRepository = new DiligenceRepository_1.DiligenceRepository();
        this.userRepository = new UserRepository_1.UserRepository();
    }
    async createDiligence(data, creatorId) {
        // CORREÇÃO: Usar findOneBy em vez de findById
        const client = await this.userRepository.findOneBy({ id: data.clientId });
        if (!client) {
            throw new errorHandler_1.AppError('Cliente não encontrado', 404);
        }
        if (data.correspondentId) {
            // CORREÇÃO: Usar findOneBy em vez de findById
            const correspondent = await this.userRepository.findOneBy({ id: data.correspondentId });
            if (!correspondent) {
                throw new errorHandler_1.AppError('Correspondente não encontrado', 404);
            }
        }
        const correspondentValue = data.correspondentValue ?? data.value * 0.7;
        // Converter a deadline para um objeto Date antes de criar
        const diligenceToCreate = {
            ...data,
            deadline: new Date(data.deadline), // Garante que seja um objeto Date
            status: (data.correspondentId ? 'assigned' : 'pending'), // Cast explícito para o tipo correto
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // CORREÇÃO: Usar createDiligence em vez de create
        const newDiligence = await this.diligenceRepository.createDiligence(diligenceToCreate);
        // Comentar temporariamente até corrigir o financialService
        // await financialService.createFinancialDataForDiligence(newDiligence, correspondentValue);
        if (newDiligence.correspondentId) {
            await NotificationService_1.default.createNotification({
                userId: newDiligence.correspondentId,
                type: 'diligence_assigned',
                title: 'Nova diligência atribuída',
                message: `Você foi atribuído à diligência: "${newDiligence.title}".`,
                data: { diligenceId: newDiligence.id }
            });
        }
        return newDiligence;
    }
    async assignDiligence(diligenceId, correspondentId) {
        // CORREÇÃO: Usar findById do DiligenceRepository (que existe) em vez de findOneBy
        const diligence = await this.diligenceRepository.findById(diligenceId);
        if (!diligence) {
            throw new errorHandler_1.AppError("Diligência não encontrada.", 404);
        }
        // CORREÇÃO: Usar findOneBy em vez de findById
        const correspondent = await this.userRepository.findOneBy({ id: correspondentId });
        if (!correspondent || correspondent.role !== 'correspondent') {
            throw new errorHandler_1.AppError("Correspondente inválido.", 404);
        }
        // Comentar temporariamente até corrigir o statusManagementService
        /*
        await statusManagementService.addStatusHistory({
            diligenceId: diligence.id,
            entityType: 'diligence',
            previousStatus: diligence.status,
            newStatus: 'assigned',
            reason: 'Atribuído pelo administrador',
            userId: 'admin-system'
        });
        */
        // CORREÇÃO: Usar updateDiligence em vez de update e retornar o resultado correto
        const updatedDiligence = await this.diligenceRepository.updateDiligence(diligenceId, {
            correspondentId: correspondentId,
            status: 'assigned',
            updatedAt: new Date()
        });
        if (!updatedDiligence) {
            throw new errorHandler_1.AppError("Erro ao atualizar diligência.", 500);
        }
        return updatedDiligence;
    }
    async acceptDiligence(diligenceId, correspondentId) {
        // CORREÇÃO: Usar findById do DiligenceRepository (que existe)
        const diligence = await this.diligenceRepository.findById(diligenceId);
        if (!diligence || diligence.correspondentId !== correspondentId) {
            throw new errorHandler_1.AppError("Diligência não encontrada ou não atribuída a este correspondente.", 404);
        }
        if (diligence.status !== 'assigned') {
            throw new errorHandler_1.AppError("Esta diligência não pode ser aceite.", 400);
        }
        // Comentar temporariamente até corrigir o statusManagementService
        /*
        await statusManagementService.addStatusHistory({
            diligenceId: diligence.id,
            entityType: 'diligence',
            previousStatus: diligence.status,
            newStatus: 'in_progress',
            reason: 'Aceite pelo correspondente',
            userId: correspondentId
        });
        */
        return this.updateDiligenceStatus(diligenceId, "in_progress", correspondentId);
    }
    async updateDiligenceStatus(diligenceId, status, userId) {
        // CORREÇÃO: Usar findById do DiligenceRepository (que existe)
        const diligence = await this.diligenceRepository.findById(diligenceId);
        if (!diligence) {
            throw new errorHandler_1.AppError("Diligência não encontrada", 404);
        }
        // Comentar temporariamente até corrigir o statusManagementService
        /*
        await statusManagementService.addStatusHistory({
            diligenceId: diligence.id,
            entityType: 'diligence',
            previousStatus: diligence.status,
            newStatus: status,
            reason: `Estado alterado por utilizador ${userId}`,
            userId: userId
        });
        */
        // CORREÇÃO: Usar updateDiligence em vez de update e retornar o resultado correto
        const updatedDiligence = await this.diligenceRepository.updateDiligence(diligenceId, {
            status: status,
            updatedAt: new Date()
        });
        if (!updatedDiligence) {
            throw new errorHandler_1.AppError("Erro ao atualizar status da diligência", 500);
        }
        return updatedDiligence;
    }
}
exports.default = new DiligenceService();
//# sourceMappingURL=diligenceService.js.map