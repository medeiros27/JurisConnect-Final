"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
// SOLUÇÃO: Importar a instância padrão do serviço
const NotificationService_1 = __importDefault(require("../services/NotificationService"));
const errorHandler_1 = require("../middlewares/errorHandler");
class NotificationController {
    constructor() {
        // O construtor não é mais necessário, pois o serviço é importado como uma instância.
        this.getUserNotifications = async (req, res) => {
            const authRequest = req;
            const userId = authRequest.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const notifications = await NotificationService_1.default.getNotifications(userId);
            return res.json(notifications);
        };
        this.markAsRead = async (req, res) => {
            const authRequest = req;
            const { id } = req.params;
            const userId = authRequest.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            await NotificationService_1.default.markAsRead(id);
            return res.json({ message: "Notificação marcada como lida" });
        };
        this.markAllAsRead = async (req, res) => {
            const authRequest = req;
            const userId = authRequest.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            await NotificationService_1.default.markAllAsRead(userId);
            return res.json({ message: "Todas as notificações marcadas como lidas" });
        };
        this.deleteNotification = async (req, res) => {
            const authRequest = req;
            const { id } = req.params;
            const userId = authRequest.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            await NotificationService_1.default.deleteNotification(id);
            return res.status(204).send();
        };
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=NotificationController.js.map