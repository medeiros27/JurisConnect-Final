"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const UserRepository_1 = require("../repositories/UserRepository");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errorHandler_1.AppError("Token não fornecido", 401);
        }
        const [, token] = authHeader.split(" ");
        if (!token) {
            throw new errorHandler_1.AppError("Token não fornecido", 401);
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "jurisconnect_secret_key_2024_super_secure_muito_longa_e_complexa");
        // Verificar se o AppDataSource está inicializado
        if (!UserRepository_1.UserRepository.canUseRepository()) {
            console.warn("⚠️ AppDataSource não inicializado, usando validação básica do token");
            // Validação básica apenas com o token (para modo demo)
            req.user = {
                id: decoded.id,
                role: decoded.role,
            };
            return next();
        }
        // Validação completa com banco de dados
        const userRepository = UserRepository_1.UserRepository.getSafeRepository();
        if (!userRepository) {
            console.warn("⚠️ Não foi possível criar UserRepository, usando validação básica do token");
            req.user = {
                id: decoded.id,
                role: decoded.role,
            };
            return next();
        }
        const user = await userRepository.findOneBy({ id: decoded.id });
        if (!user) {
            throw new errorHandler_1.AppError("Usuário não encontrado", 401);
        }
        if (user.status !== "active") {
            throw new errorHandler_1.AppError("Usuário inativo ou pendente", 401);
        }
        // Adicionar informações do usuário à requisição
        req.user = {
            id: user.id,
            role: user.role,
        };
        return next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new errorHandler_1.AppError("Token inválido", 401);
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new errorHandler_1.AppError("Token expirado", 401);
        }
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        console.error("Erro no middleware de autenticação:", error);
        throw new errorHandler_1.AppError("Erro interno de autenticação", 500);
    }
};
exports.authMiddleware = authMiddleware;
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new errorHandler_1.AppError("Não autorizado", 401);
        }
        if (!roles.includes(req.user.role)) {
            throw new errorHandler_1.AppError("Permissão negada", 403);
        }
        return next();
    };
};
exports.checkRole = checkRole;
//# sourceMappingURL=authMiddleware.js.map