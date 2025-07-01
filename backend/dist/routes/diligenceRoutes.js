"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DiligenceController_1 = require("../controllers/DiligenceController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const diligenceController = new DiligenceController_1.DiligenceController();
// Middleware de autenticação para todas as rotas de diligência
router.use(authMiddleware_1.authMiddleware);
// Rotas para Admin e Cliente
router.post("/", (0, authMiddleware_1.checkRole)(["admin", "client"]), diligenceController.createDiligence);
router.get("/client/my-diligences", (0, authMiddleware_1.checkRole)(["client"]), diligenceController.getMyDiligences);
// Rotas específicas para correspondentes
router.get("/correspondent/my-diligences", (0, authMiddleware_1.checkRole)(["correspondent"]), diligenceController.getMyDiligences);
router.get("/available", (0, authMiddleware_1.checkRole)(["correspondent"]), diligenceController.getAvailableDiligences);
// Rotas para Admin (gerenciamento geral)
router.get("/all", (0, authMiddleware_1.checkRole)(["admin"]), diligenceController.getAllDiligences);
// Rotas para todos os usuários autenticados (visualização de detalhes)
router.get("/:id", diligenceController.getDiligenceById);
// Rotas para atualização de status e atribuição
router.put("/:id/assign", (0, authMiddleware_1.checkRole)(["admin"]), diligenceController.assignDiligence);
router.put("/:id/accept", (0, authMiddleware_1.checkRole)(["correspondent"]), diligenceController.acceptDiligence);
router.put("/:id/start", (0, authMiddleware_1.checkRole)(["correspondent"]), diligenceController.startDiligence);
router.put("/:id/complete", (0, authMiddleware_1.checkRole)(["correspondent"]), diligenceController.completeDiligence);
router.put("/:id/status", (0, authMiddleware_1.checkRole)(["admin", "client", "correspondent"]), diligenceController.updateStatus);
// Rota para histórico de status
router.get("/:id/history", diligenceController.getStatusHistory);
exports.default = router;
//# sourceMappingURL=diligenceRoutes.js.map