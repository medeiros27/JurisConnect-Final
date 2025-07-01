"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiligenceRepository = void 0;
const data_source_1 = require("../data-source");
const Diligence_1 = require("../entities/Diligence");
const typeorm_1 = require("typeorm");
const errorHandler_1 = require("../middlewares/errorHandler");
class DiligenceRepository extends typeorm_1.Repository {
    constructor() {
        // Verificar se o AppDataSource está inicializado antes de criar o repositório
        if (!data_source_1.AppDataSource.isInitialized) {
            throw new Error("AppDataSource não está inicializado. Certifique-se de que o banco de dados foi conectado.");
        }
        super(Diligence_1.Diligence, data_source_1.AppDataSource.manager);
    }
    async findAll() {
        return this.find({
            relations: ["client", "correspondent", "attachments", "statusHistory"],
        });
    }
    async findById(id) {
        return this.findOne({
            where: { id },
            relations: ["client", "correspondent", "attachments", "statusHistory", "paymentProof"],
        });
    }
    // Renomeado de 'create' para 'createDiligence' para evitar conflito com o método base do TypeORM
    async createDiligence(diligenceData) {
        const diligence = this.create(diligenceData); // Usa o método 'create' da classe base Repository
        return this.save(diligence); // Usa o método 'save' da classe base Repository
    }
    // Renomeado de 'update' para 'updateDiligence' para evitar conflito com o método base do TypeORM
    async updateDiligence(id, diligenceData) {
        const diligence = await this.findById(id); // Usa o método findById personalizado
        if (!diligence) {
            throw new errorHandler_1.AppError("Diligência não encontrada", 404);
        }
        this.merge(diligence, diligenceData); // Usa o método 'merge' da classe base Repository
        return this.save(diligence); // Usa o método 'save' da classe base Repository
    }
    // Renomeado de 'delete' para 'deleteDiligence' para evitar conflito e corrigida a implementação
    async deleteDiligence(id) {
        const result = await super.delete(id); // Chama o método 'delete' da classe pai (Repository)
        if (result.affected === 0) {
            throw new errorHandler_1.AppError("Diligência não encontrada para exclusão", 404);
        }
        return result;
    }
    async findByClient(clientId) {
        return this.find({
            where: { clientId },
            relations: ["client", "correspondent", "attachments", "statusHistory"],
        });
    }
    async findByCorrespondent(correspondentId) {
        return this.find({
            where: { correspondentId },
            relations: ["client", "correspondent", "attachments", "statusHistory"],
        });
    }
    async findAvailableDiligences(state, city) {
        const query = this
            .createQueryBuilder("diligence")
            .leftJoinAndSelect("diligence.client", "client")
            .where("diligence.status = :status", { status: "pending" });
        if (state) {
            query.andWhere("diligence.state = :state", { state });
        }
        if (city) {
            query.andWhere("diligence.city ILIKE :city", { city: `%${city}%` });
        }
        return query.getMany();
    }
    // Método estático para verificar se o repositório pode ser usado
    static canUseRepository() {
        return data_source_1.AppDataSource.isInitialized;
    }
    // Método estático para obter o repositório de forma segura
    static getSafeRepository() {
        try {
            if (data_source_1.AppDataSource.isInitialized) {
                return new DiligenceRepository();
            }
            return null;
        }
        catch (error) {
            console.error("Erro ao criar DiligenceRepository:", error);
            return null;
        }
    }
}
exports.DiligenceRepository = DiligenceRepository;
//# sourceMappingURL=DiligenceRepository.js.map