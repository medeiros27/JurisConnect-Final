"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserRepository_1 = require("../repositories/UserRepository");
class UserService {
    constructor() {
        this.userRepository = new UserRepository_1.UserRepository();
    }
    async createUser(data) {
        const existingUser = await this.userRepository.findOneBy({ email: data.email });
        if (existingUser) {
            throw new Error("Email já está em uso");
        }
        const newUser = this.userRepository.create({
            email: data.email,
            role: data.role,
            status: data.status,
            phone: data.phone,
            oab: data.oab,
            city: data.city,
            state: data.state
        });
        await this.userRepository.save(newUser);
        return newUser;
    }
    async updateUser(id, data) {
        const userToUpdate = await this.userRepository.findOneBy({ id });
        if (!userToUpdate) {
            throw new Error("Usuário não encontrado");
        }
        if (data.email && data.email !== userToUpdate.email) {
            const existingUser = await this.userRepository.findOneBy({ email: data.email });
            if (existingUser && existingUser.id !== id) {
                throw new Error("Email já está em uso");
            }
        }
        Object.assign(userToUpdate, data);
        await this.userRepository.save(userToUpdate);
        return userToUpdate;
    }
    async deleteUser(id) {
        const userToDelete = await this.userRepository.findOneBy({ id });
        if (!userToDelete) {
            throw new Error("Usuário não encontrado");
        }
        if (userToDelete.role === 'admin') {
            const adminCount = await this.userRepository.count({ where: { role: 'admin' } });
            if (adminCount <= 1) {
                throw new Error("Não é possível deletar o último administrador");
            }
        }
        await this.userRepository.remove(userToDelete);
    }
    async getUsers() {
        return this.userRepository.find();
    }
    async getUserById(id) {
        return this.userRepository.findOneBy({ id });
    }
    async getUserByEmail(email) {
        return this.userRepository.findOneBy({ email });
    }
    async getCorrespondents(state, city) {
        const whereClause = { role: 'correspondent', status: 'active' };
        if (state) {
            whereClause.state = state;
        }
        if (city) {
            whereClause.city = city;
        }
        return this.userRepository.find({ where: whereClause });
    }
    async getPendingCorrespondents() {
        return this.userRepository.find({ where: { role: 'correspondent', status: 'pending' } });
    }
    async approveCorrespondent(id) {
        return this.updateUser(id, { status: 'active' });
    }
    async rejectCorrespondent(id) {
        await this.deleteUser(id);
    }
    async updateUserStatus(id, status) {
        return this.updateUser(id, { status });
    }
}
exports.default = new UserService();
//# sourceMappingURL=userService.js.map