"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NotificationRepository_1 = require("../repositories/NotificationRepository"); // Importar o repositório personalizado
class NotificationService {
    constructor() {
        this.notificationRepository = new NotificationRepository_1.NotificationRepository(); // Instanciar o repositório personalizado
    }
    async createNotification(data) {
        // Chamar o método personalizado do NotificationRepository
        const newNotification = await this.notificationRepository.createNotification({
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data || {},
            read: false,
            createdAt: new Date()
        });
        return newNotification;
    }
    async getNotifications(userId) {
        // Chamar o método personalizado do NotificationRepository
        return this.notificationRepository.findByUser(userId);
    }
    async markAsRead(notificationId) {
        // Chamar o método personalizado do NotificationRepository
        await this.notificationRepository.markAsRead(notificationId);
    }
    async markAllAsRead(userId) {
        // Chamar o método personalizado do NotificationRepository
        await this.notificationRepository.markAllAsRead(userId);
    }
    async deleteNotification(notificationId) {
        // Chamar o método personalizado do NotificationRepository
        return this.notificationRepository.deleteNotification(notificationId);
    }
}
exports.default = new NotificationService();
//# sourceMappingURL=NotificationService.js.map