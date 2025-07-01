"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const errorHandler_1 = require("../middlewares/errorHandler");
class UserController {
    constructor() {
        this.getAllUsers = async (req, res) => {
            const userRepository = this.getUserRepository();
            const users = await userRepository.find();
            return res.json(users);
        };
        this.getUserById = async (req, res) => {
            const { id } = req.params;
            const userRepository = this.getUserRepository();
            const user = await userRepository.findOneBy({ id });
            if (!user) {
                throw new errorHandler_1.AppError("Usuário não encontrado", 404);
            }
            return res.json(user);
        };
        this.createUser = async (req, res) => {
            const { name, email, password, role, phone, cnpj, state, city } = req.body;
            const userRepository = this.getUserRepository();
            // Verificar se o usuário já existe
            const existingUser = await userRepository.findOne({ where: { email } });
            if (existingUser) {
                throw new errorHandler_1.AppError("Email já está em uso", 400);
            }
            // Criar novo usuário
            const user = userRepository.create({
                name,
                email,
                password, // A senha deve ser hasheada no service ou antes de salvar
                role,
                phone,
                cnpj,
                state,
                city,
                status: role === "correspondent" ? "pending" : "active"
            });
            await userRepository.save(user);
            // Remover senha da resposta
            const { password: _, ...userWithoutPassword } = user;
            return res.status(201).json(userWithoutPassword);
        };
        this.updateUser = async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;
            const userRepository = this.getUserRepository();
            const user = await userRepository.findOneBy({ id });
            if (!user) {
                throw new errorHandler_1.AppError("Usuário não encontrado", 404);
            }
            // Atualizar dados do usuário
            Object.assign(user, updateData);
            await userRepository.save(user);
            // Remover senha da resposta
            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        };
        this.deleteUser = async (req, res) => {
            const { id } = req.params;
            const userRepository = this.getUserRepository();
            const user = await userRepository.findOneBy({ id });
            if (!user) {
                throw new errorHandler_1.AppError("Usuário não encontrado", 404);
            }
            await userRepository.remove(user);
            return res.status(204).send();
        };
        this.getProfile = async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const userRepository = this.getUserRepository();
            const user = await userRepository.findOneBy({ id: userId });
            if (!user) {
                throw new errorHandler_1.AppError("Usuário não encontrado", 404);
            }
            // Remover senha da resposta
            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        };
        this.updateProfile = async (req, res) => {
            const userId = req.user?.id;
            const { name, phone, state, city } = req.body;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const userRepository = this.getUserRepository();
            const user = await userRepository.findOneBy({ id: userId });
            if (!user) {
                throw new errorHandler_1.AppError("Usuário não encontrado", 404);
            }
            // Atualizar apenas campos permitidos
            user.name = name || user.name;
            user.phone = phone || user.phone;
            user.state = state || user.state;
            user.city = city || user.city;
            await userRepository.save(user);
            // Remover senha da resposta
            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
        };
        this.getCorrespondents = async (req, res) => {
            const { state, city } = req.query;
            const userRepository = this.getUserRepository();
            const correspondents = await userRepository.findCorrespondents(state, city);
            return res.json(correspondents);
        };
        this.getPendingCorrespondents = async (req, res) => {
            const userRepository = this.getUserRepository();
            const pendingCorrespondents = await userRepository.findPendingCorrespondents();
            return res.json(pendingCorrespondents);
        };
        this.approveCorrespondent = async (req, res) => {
            const { id } = req.params;
            const userRepository = this.getUserRepository();
            const correspondent = await userRepository.findOneBy({ id });
            if (!correspondent) {
                throw new errorHandler_1.AppError("Correspondente não encontrado", 404);
            }
            if (correspondent.role !== "correspondent") {
                throw new errorHandler_1.AppError("Usuário não é um correspondente", 400);
            }
            correspondent.status = "active";
            await userRepository.save(correspondent);
            return res.json({ message: "Correspondente aprovado com sucesso" });
        };
        this.rejectCorrespondent = async (req, res) => {
            const { id } = req.params;
            const userRepository = this.getUserRepository();
            const correspondent = await userRepository.findOneBy({ id });
            if (!correspondent) {
                throw new errorHandler_1.AppError("Correspondente não encontrado", 404);
            }
            if (correspondent.role !== "correspondent") {
                throw new errorHandler_1.AppError("Usuário não é um correspondente", 400);
            }
            correspondent.status = "rejected";
            await userRepository.save(correspondent);
            return res.json({ message: "Correspondente rejeitado" });
        };
    }
    // Remover a instanciação no construtor
    getUserRepository() {
        // Usar o método seguro para obter o repositório
        const repository = UserRepository_1.UserRepository.getSafeRepository();
        if (!repository) {
            throw new errorHandler_1.AppError("Banco de dados não disponível", 500);
        }
        return repository;
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map