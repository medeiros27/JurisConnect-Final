"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const DiligenceRepository_1 = require("../repositories/DiligenceRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const PaymentRepository_1 = require("../repositories/PaymentRepository");
const errorHandler_1 = require("../middlewares/errorHandler");
class PlatformService {
    constructor() {
        this.diligenceRepository = new DiligenceRepository_1.DiligenceRepository();
        this.userRepository = new UserRepository_1.UserRepository();
        this.paymentRepository = new PaymentRepository_1.PaymentRepository();
    }
    async getDashboardStats(userId, userRole) {
        const stats = {
            totalDiligences: 0,
            pendingDiligences: 0,
            completedDiligences: 0,
            totalPayments: 0,
            pendingPayments: 0,
            completedPayments: 0,
            totalUsers: 0,
            activeUsers: 0,
        };
        if (userRole === 'admin') {
            stats.totalDiligences = await this.diligenceRepository.count();
            stats.pendingDiligences = await this.diligenceRepository.count({ where: { status: 'pending' } });
            stats.completedDiligences = await this.diligenceRepository.count({ where: { status: 'completed' } });
            stats.totalPayments = await this.paymentRepository.count();
            stats.pendingPayments = await this.paymentRepository.count({ where: { status: 'pending' } });
            stats.completedPayments = await this.paymentRepository.count({ where: { status: 'completed' } });
            stats.totalUsers = await this.userRepository.count();
            stats.activeUsers = await this.userRepository.count({ where: { status: 'active' } });
        }
        else if (userRole === 'client') {
            stats.totalDiligences = await this.diligenceRepository.count({ where: { clientId: userId } });
            stats.pendingDiligences = await this.diligenceRepository.count({ where: { clientId: userId, status: 'pending' } });
            stats.completedDiligences = await this.diligenceRepository.count({ where: { clientId: userId, status: 'completed' } });
            stats.totalPayments = await this.paymentRepository.count({ where: { diligence: { clientId: userId } } });
            stats.pendingPayments = await this.paymentRepository.count({ where: { diligence: { clientId: userId }, status: 'pending' } });
            stats.completedPayments = await this.paymentRepository.count({ where: { diligence: { clientId: userId }, status: 'completed' } });
        }
        else if (userRole === 'correspondent') {
            stats.totalDiligences = await this.diligenceRepository.count({ where: { correspondentId: userId } });
            stats.pendingDiligences = await this.diligenceRepository.count({ where: { correspondentId: userId, status: 'pending' } });
            stats.completedDiligences = await this.diligenceRepository.count({ where: { correspondentId: userId, status: 'completed' } });
            stats.totalPayments = await this.paymentRepository.count({ where: { diligence: { correspondentId: userId } } });
            stats.pendingPayments = await this.paymentRepository.count({ where: { diligence: { correspondentId: userId }, status: 'pending' } });
            stats.completedPayments = await this.paymentRepository.count({ where: { diligence: { correspondentId: userId }, status: 'completed' } });
        }
        return stats;
    }
    async findBestCorrespondent(diligenceData) {
        const correspondents = await this.userRepository.find({
            where: {
                role: 'correspondent',
                status: 'active',
                state: diligenceData.state,
            }
        });
        if (correspondents.length === 0) {
            throw new errorHandler_1.AppError("Nenhum correspondente disponível para esta localização", 404);
        }
        // Algoritmo simples: retorna o primeiro correspondente ativo na mesma região
        // Aqui você pode implementar lógica mais complexa de scoring
        const scoredCorrespondents = correspondents.map(correspondent => ({
            correspondent,
            score: this.calculateCorrespondentScore(correspondent, diligenceData)
        }));
        scoredCorrespondents.sort((a, b) => b.score - a.score);
        return scoredCorrespondents[0].correspondent;
    }
    calculateCorrespondentScore(correspondent, diligenceData) {
        let score = 0;
        // Pontuação base
        score += 10;
        // Mesma cidade = +20 pontos
        if (correspondent.city === diligenceData.city) {
            score += 20;
        }
        // Mesmo estado = +10 pontos
        if (correspondent.state === diligenceData.state) {
            score += 10;
        }
        return score;
    }
    async assignDiligenceToCorrespondent(diligenceId, correspondentId) {
        const diligence = await this.diligenceRepository.findById(diligenceId);
        if (!diligence) {
            throw new errorHandler_1.AppError("Diligência não encontrada", 404);
        }
        const correspondent = await this.userRepository.findOneBy({ id: correspondentId });
        if (!correspondent || correspondent.role !== 'correspondent') {
            throw new errorHandler_1.AppError("Correspondente não encontrado", 404);
        }
        // CORREÇÃO: Usar updateDiligence em vez de update
        const updatedDiligence = await this.diligenceRepository.updateDiligence(diligenceId, {
            correspondentId: correspondentId,
            status: "assigned",
            updatedAt: new Date()
        });
        if (!updatedDiligence) {
            throw new errorHandler_1.AppError("Erro ao atualizar diligência", 500);
        }
        return updatedDiligence;
    }
    async createPayment(diligenceId, paymentData) {
        const diligence = await this.diligenceRepository.findById(diligenceId);
        if (!diligence) {
            throw new errorHandler_1.AppError("Diligência não encontrada", 404);
        }
        // CORREÇÃO: Usar createPayment em vez de create
        const newPayment = await this.paymentRepository.createPayment({
            ...paymentData,
            diligence: diligence,
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return newPayment;
    }
    async updatePaymentStatus(paymentId, status) {
        // CORREÇÃO: Usar updatePayment em vez de update
        const updatedPayment = await this.paymentRepository.updatePayment(paymentId, {
            status: status,
            updatedAt: new Date()
        });
        if (!updatedPayment) {
            throw new errorHandler_1.AppError("Pagamento não encontrado", 404);
        }
        return updatedPayment;
    }
    async getSystemHealth() {
        try {
            // Verificar conexão com o banco de dados
            await data_source_1.AppDataSource.query('SELECT 1');
            return {
                status: 'healthy',
                database: 'connected',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                database: 'disconnected',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async getSystemMetrics() {
        const totalDiligences = await this.diligenceRepository.count();
        const totalUsers = await this.userRepository.count();
        const totalPayments = await this.paymentRepository.count();
        return {
            totalDiligences,
            totalUsers,
            totalPayments,
            timestamp: new Date().toISOString()
        };
    }
    async getAllClients() {
        return this.userRepository.find({ where: { role: 'client' } });
    }
    async getAllCorrespondents() {
        return this.userRepository.find({ where: { role: 'correspondent' } });
    }
    async getAllPayments() {
        return this.paymentRepository.find();
    }
    async getAllDiligences() {
        return this.diligenceRepository.find();
    }
}
exports.default = new PlatformService();
//# sourceMappingURL=platformService.js.map