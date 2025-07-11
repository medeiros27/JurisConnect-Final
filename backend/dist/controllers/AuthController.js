"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
class AuthController {
    constructor() {
        // Usar arrow functions para preservar o contexto 'this'
        this.login = async (req, res) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: "Email e senha são obrigatórios"
                    });
                }
                const authService = this.getAuthService();
                const result = await authService.login(email, password);
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: {
                        user: {
                            id: result.user.id,
                            name: result.user.name,
                            email: result.user.email,
                            role: result.user.role,
                            status: result.user.status
                        },
                        token: result.token
                    }
                });
            }
            catch (error) {
                console.error("Erro no login:", error);
                res.status(401).json({
                    success: false,
                    message: error.message || "Erro interno do servidor"
                });
            }
        };
        this.register = async (req, res) => {
            try {
                const { name, email, password, role } = req.body;
                if (!name || !email || !password || !role) {
                    return res.status(400).json({
                        success: false,
                        message: "Nome, email, senha e role são obrigatórios"
                    });
                }
                const authService = this.getAuthService();
                const result = await authService.register({
                    name,
                    email,
                    password,
                    role
                });
                res.status(201).json({
                    success: true,
                    message: result.message,
                    data: {
                        user: result.user
                    }
                });
            }
            catch (error) {
                console.error("Erro no registro:", error);
                res.status(400).json({
                    success: false,
                    message: error.message || "Erro interno do servidor"
                });
            }
        };
        this.registerClient = async (req, res) => {
            try {
                const { name, email, password, companyName, cnpj } = req.body;
                if (!name || !email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: "Nome, email e senha são obrigatórios"
                    });
                }
                const authService = this.getAuthService();
                const result = await authService.register({
                    name,
                    email,
                    password,
                    role: "client"
                });
                res.status(201).json({
                    success: true,
                    message: "Cliente registrado com sucesso",
                    data: {
                        user: result.user
                    }
                });
            }
            catch (error) {
                console.error("Erro no registro de cliente:", error);
                res.status(400).json({
                    success: false,
                    message: error.message || "Erro interno do servidor"
                });
            }
        };
        this.registerCorrespondent = async (req, res) => {
            try {
                const { name, email, password, oab, city, state, specialties } = req.body;
                if (!name || !email || !password) {
                    return res.status(400).json({
                        success: false,
                        message: "Nome, email e senha são obrigatórios"
                    });
                }
                const authService = this.getAuthService();
                const result = await authService.register({
                    name,
                    email,
                    password,
                    role: "correspondent"
                });
                res.status(201).json({
                    success: true,
                    message: "Correspondente registrado com sucesso",
                    data: {
                        user: result.user
                    }
                });
            }
            catch (error) {
                console.error("Erro no registro de correspondente:", error);
                res.status(400).json({
                    success: false,
                    message: error.message || "Erro interno do servidor"
                });
            }
        };
        this.getProfile = async (req, res) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: "Token inválido"
                    });
                }
                const authService = this.getAuthService();
                const user = await authService.getUserProfile(userId);
                res.status(200).json({
                    success: true,
                    message: "Perfil recuperado com sucesso",
                    data: {
                        user
                    }
                });
            }
            catch (error) {
                console.error("Erro ao buscar perfil:", error);
                res.status(404).json({
                    success: false,
                    message: error.message || "Erro interno do servidor"
                });
            }
        };
        this.refreshToken = async (req, res) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    return res.status(401).json({
                        success: false,
                        message: "Token inválido"
                    });
                }
                const authService = this.getAuthService();
                const result = await authService.refreshToken(userId);
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: {
                        token: result.token,
                        user: result.user
                    }
                });
            }
            catch (error) {
                console.error("Erro ao renovar token:", error);
                res.status(401).json({
                    success: false,
                    message: error.message || "Erro interno do servidor"
                });
            }
        };
        this.logout = async (req, res) => {
            try {
                // Para logout, simplesmente retornamos sucesso
                // O frontend deve remover o token do localStorage
                res.status(200).json({
                    success: true,
                    message: "Logout realizado com sucesso"
                });
            }
            catch (error) {
                console.error("Erro no logout:", error);
                res.status(500).json({
                    success: false,
                    message: "Erro interno do servidor"
                });
            }
        };
        this.health = async (req, res) => {
            try {
                res.status(200).json({
                    status: "ok",
                    timestamp: new Date().toISOString(),
                    service: "JurisConnect Auth Service",
                    version: "1.0.0"
                });
            }
            catch (error) {
                console.error("Erro no health check:", error);
                res.status(500).json({
                    status: "error",
                    message: "Erro interno do servidor"
                });
            }
        };
    }
    // Implementar lazy loading para o AuthService
    getAuthService() {
        return new AuthService_1.AuthService();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map