"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusRoutes = void 0;
const express_1 = require("express");
const StatusManagementController_1 = require("../controllers/StatusManagementController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
exports.statusRoutes = router;
const statusController = new StatusManagementController_1.StatusManagementController();
// Todas as rotas de status requerem autenticação
router.use(authMiddleware_1.authMiddleware);
// Rotas para verificar possibilidade de reversão
router.get("/can-revert", statusController.canRevertStatus);
// Rotas para reversão de status
router.post("/revert", statusController.revertStatus);
// Rotas para histórico de status
router.get("/history/diligence/:id", statusController.getDiligenceStatusHistory);
router.get("/history/payment/:id", statusController.getPaymentStatusHistory);
router.get("/history/all", (0, authMiddleware_1.checkRole)(["admin"]), statusController.getAllStatusHistory);
//# sourceMappingURL=statusRoutes.js.map