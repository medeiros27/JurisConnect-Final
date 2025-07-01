"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
class AuthService {
    // Remover instanciação direta do repositório
    getUserRepository() {
        if (!data_source_1.AppDataSource.isInitialized) {
            throw new Error("Banco de dados não está disponível");
        }
        return data_source_1.AppDataSource.getRepository(User_1.User);
    }
    // Dados mockados para modo demo - CORRIGIDO com senhas válidas
    getMockUsers() {
        return [
            {
                id: "1",
                name: "Administrador",
                email: "admin@jurisconnect.com",
                password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G", // admin123
                role: "admin",
                status: "active",
                phone: "(11) 99999-9999",
                cnpj: "123.456.789-00"
            },
            {
                id: "2",
                name: "Cliente Demo",
                email: "cliente@demo.com",
                password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G", // demo123
                role: "client",
                status: "active",
                phone: "(11) 88888-8888",
                cnpj: "987.654.321-00"
            },
            {
                id: "3",
                name: "Correspondente Demo",
                email: "correspondente@demo.com",
                password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G", // demo123
                role: "correspondent",
                status: "active",
                phone: "(11) 77777-7777",
                cnpj: "456.789.123-00"
            }
        ];
    }
    // Configurações JWT com valores padrão seguros
    getJWTSecret() {
        return process.env.JWT_SECRET || "jurisconnect_secret_key_2024_super_secure_muito_longa_e_complexa";
    }
    getJWTExpiresIn() {
        const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
        // Se for um número, converter para number, senão manter como string
        if (/^\d+$/.test(expiresIn)) {
            return parseInt(expiresIn);
        }
        return expiresIn;
    }
    async login(email, password) {
        try {
            console.log("🔍 Tentativa de login para:", email);
            // Validar parâmetros de entrada
            if (!email || !password) {
                throw new Error("Email e senha são obrigatórios");
            }
            let user;
            // Verificar se o banco de dados está disponível
            if (data_source_1.AppDataSource.isInitialized) {
                // Modo completo com banco de dados
                console.log("💾 Usando banco de dados PostgreSQL");
                const userRepository = this.getUserRepository();
                user = await userRepository.findOne({
                    where: { email },
                    select: ["id", "name", "email", "password", "role", "status"] // Incluir password explicitamente
                });
            }
            else {
                // Modo demo com dados mockados
                console.log("🔄 Modo demo ativo - usando dados mockados");
                const mockUsers = this.getMockUsers();
                user = mockUsers.find(u => u.email === email);
            }
            if (!user) {
                console.log("❌ Usuário não encontrado:", email);
                throw new Error("Credenciais inválidas");
            }
            console.log("✅ Usuário encontrado:", user.email);
            // Verificar se a senha existe
            if (!user.password) {
                console.error("❌ Senha não encontrada para o usuário:", user.email);
                throw new Error("Erro interno: senha não encontrada");
            }
            console.log("🔐 Verificando senha...");
            // Verificar senha
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.log("❌ Senha inválida para:", email);
                throw new Error("Credenciais inválidas");
            }
            console.log("✅ Senha válida, gerando token...");
            // Gerar token JWT
            const tokenPayload = {
                id: user.id,
                role: user.role,
                email: user.email
            };
            const jwtSecret = this.getJWTSecret();
            const jwtExpiresIn = this.getJWTExpiresIn();
            // Usar a assinatura correta do JWT
            const token = jwt.sign(tokenPayload, jwtSecret, {
                expiresIn: jwtExpiresIn
            });
            console.log("✅ Token gerado com sucesso");
            // Remover senha do retorno
            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            };
            return {
                user: userResponse,
                token,
                message: "Login realizado com sucesso"
            };
        }
        catch (error) {
            console.error("❌ Erro no login:", error);
            throw error;
        }
    }
    async register(userData) {
        try {
            const userRepository = this.getUserRepository();
            // Verificar se email já existe
            const existingUser = await userRepository.findOne({
                where: { email: userData.email }
            });
            if (existingUser) {
                throw new Error("Email já cadastrado");
            }
            // Hash da senha
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            // Criar usuário
            const user = userRepository.create({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
                status: "active"
            });
            const savedUser = await userRepository.save(user);
            // Resposta sem senha
            const userResponse = {
                id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                status: savedUser.status
            };
            return {
                user: userResponse,
                message: "Usuário criado com sucesso"
            };
        }
        catch (error) {
            console.error("Erro no registro:", error);
            throw error;
        }
    }
    async getUserProfile(userId) {
        try {
            let user;
            if (data_source_1.AppDataSource.isInitialized) {
                const userRepository = this.getUserRepository();
                user = await userRepository.findOne({
                    where: { id: userId }
                });
            }
            else {
                // Modo demo
                const mockUsers = this.getMockUsers();
                user = mockUsers.find(u => u.id === userId);
            }
            if (!user) {
                throw new Error("Usuário não encontrado");
            }
            // Resposta sem senha
            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            };
            return userResponse;
        }
        catch (error) {
            console.error("Erro ao buscar perfil:", error);
            throw error;
        }
    }
    verifyToken(token) {
        try {
            const jwtSecret = this.getJWTSecret();
            const decoded = jwt.verify(token, jwtSecret);
            return decoded;
        }
        catch (error) {
            console.error("Erro ao verificar token:", error);
            throw new Error("Token inválido");
        }
    }
    async refreshToken(userId) {
        try {
            const user = await this.getUserProfile(userId);
            const tokenPayload = {
                id: user.id,
                role: user.role,
                email: user.email
            };
            const jwtSecret = this.getJWTSecret();
            const jwtExpiresIn = this.getJWTExpiresIn();
            const token = jwt.sign(tokenPayload, jwtSecret, {
                expiresIn: jwtExpiresIn
            });
            return {
                token,
                user,
                message: "Token renovado com sucesso"
            };
        }
        catch (error) {
            console.error("Erro ao renovar token:", error);
            throw error;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map