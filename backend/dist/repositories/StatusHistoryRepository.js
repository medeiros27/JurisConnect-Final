"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusHistoryRepository = void 0;
const data_source_1 = require("../data-source");
const StatusHistory_1 = require("../entities/StatusHistory");
const typeorm_1 = require("typeorm");
class StatusHistoryRepository extends typeorm_1.Repository {
    constructor() {
        // Verificar se o AppDataSource está inicializado antes de criar o repositório
        if (!data_source_1.AppDataSource.isInitialized) {
            throw new Error("AppDataSource não está inicializado. Certifique-se de que o banco de dados foi conectado.");
        }
        super(StatusHistory_1.StatusHistory, data_source_1.AppDataSource.manager);
    }
    // Renomeado de 'create' para 'createStatusHistory' para evitar conflito com o método base do TypeORM
    async createStatusHistory(statusHistoryData) {
        const statusHistory = this.create(statusHistoryData); // Usa o método 'create' da classe base Repository
        return this.save(statusHistory); // Usa o método 'save' da classe base Repository
    }
    async findByDiligenceId(diligenceId) {
        return this.find({
            where: {
                diligenceId,
                entityType: "diligence",
            },
            relations: ["user"],
            order: {
                timestamp: "DESC",
            },
        });
    }
    async findByPaymentId(paymentId) {
        return this.find({
            where: {
                paymentId,
                entityType: "payment",
            },
            relations: ["user"],
            order: {
                timestamp: "DESC",
            },
        });
    }
    async findAll() {
        return this.find();
    }
    // Método estático para verificar se o repositório pode ser usado
    static canUseRepository() {
        return data_source_1.AppDataSource.isInitialized;
    }
    // Método estático para obter o repositório de forma segura
    static getSafeRepository() {
        try {
            if (data_source_1.AppDataSource.isInitialized) {
                return new StatusHistoryRepository();
            }
            return null;
        }
        catch (error) {
            console.error("Erro ao criar StatusHistoryRepository:", error);
            return null;
        }
    }
}
exports.StatusHistoryRepository = StatusHistoryRepository;
//# sourceMappingURL=StatusHistoryRepository.js.map