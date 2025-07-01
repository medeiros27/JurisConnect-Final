"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const data_source_1 = require("../data-source");
const Notification_1 = require("../entities/Notification");
const typeorm_1 = require("typeorm");
class NotificationRepository extends typeorm_1.Repository {
    constructor() {
        super(Notification_1.Notification, data_source_1.AppDataSource.manager);
    }
    // Renomeado de 'create' para 'createNotification' para evitar conflito com o método base do TypeORM
    async createNotification(notificationData) {
        const notification = this.create(notificationData); // Usa o método 'create' da classe base Repository
        return this.save(notification); // Usa o método 'save' da classe base Repository
    }
    async findById(id) {
        return this.findOne({
            where: { id },
            relations: ["user"],
        });
    }
    async findByUser(userId) {
        return this.find({
            where: { userId },
            order: { createdAt: "DESC" },
        });
    }
    async markAsRead(id) {
        await this.update(id, { read: true });
    }
    async markAllAsRead(userId) {
        await this
            .createQueryBuilder()
            .update(Notification_1.Notification)
            .set({ read: true })
            .where("userId = :userId AND read = :read", { userId, read: false })
            .execute();
    }
    // Renomeado de 'delete' para 'deleteNotification' para evitar conflito e corrigida a implementação
    async deleteNotification(id) {
        const result = await super.delete(id); // Chama o método 'delete' da classe pai (Repository)
        return result;
    }
}
exports.NotificationRepository = NotificationRepository;
//# sourceMappingURL=NotificationRepository.js.map