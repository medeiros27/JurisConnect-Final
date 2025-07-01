"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const typeorm_1 = require("typeorm");
class UserRepository extends typeorm_1.Repository {
    constructor() {
        // Verificar se o AppDataSource está inicializado antes de criar o repositório
        if (!data_source_1.AppDataSource.isInitialized) {
            throw new Error("AppDataSource não está inicializado. Certifique-se de que o banco de dados foi conectado.");
        }
        super(User_1.User, data_source_1.AppDataSource.manager);
    }
    async findByEmailWithPassword(email) {
        return this
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.email = :email", { email })
            .getOne();
    }
    async findCorrespondents(state, city) {
        const query = this
            .createQueryBuilder("user")
            .where("user.role = :role", { role: "correspondent" })
            .andWhere("user.status = :status", { status: "active" });
        if (state) {
            query.andWhere("user.state = :state", { state });
        }
        if (city) {
            query.andWhere("user.city ILIKE :city", { city: `%${city}%` });
        }
        return query.getMany();
    }
    async findPendingCorrespondents() {
        return this.find({
            where: {
                role: "correspondent",
                status: "pending",
            },
        });
    }
    // Método estático para verificar se o repositório pode ser usado
    static canUseRepository() {
        return data_source_1.AppDataSource.isInitialized;
    }
    // Método estático para obter o repositório de forma segura
    static getSafeRepository() {
        try {
            if (data_source_1.AppDataSource.isInitialized) {
                return new UserRepository();
            }
            return null;
        }
        catch (error) {
            console.error("Erro ao criar UserRepository:", error);
            return null;
        }
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map