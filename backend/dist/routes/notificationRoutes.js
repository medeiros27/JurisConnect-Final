"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotificationController_1 = require("../controllers/NotificationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const notificationController = new NotificationController_1.NotificationController();
// Todas as rotas de notificação requerem autenticação
router.use(authMiddleware_1.authMiddleware);
router.get("/", notificationController.getUserNotifications);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);
router.delete("/:id", notificationController.deleteNotification);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map