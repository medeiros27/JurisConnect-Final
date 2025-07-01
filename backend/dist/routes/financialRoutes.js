"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FinancialController_1 = require("../controllers/FinancialController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const financialController = new FinancialController_1.FinancialController();
// Middleware de autenticação para todas as rotas financeiras
router.use(authMiddleware_1.authMiddleware);
// Rotas para clientes
router.post("/proof/upload", (0, authMiddleware_1.checkRole)(["client"]), financialController.uploadPaymentProof.bind(financialController));
router.get("/proof/diligence/:diligenceId", (0, authMiddleware_1.checkRole)(["client", "correspondent", "admin"]), financialController.getPaymentProofByDiligenceId.bind(financialController));
// Rotas para correspondentes
router.get("/correspondent/payments", (0, authMiddleware_1.checkRole)(["correspondent"]), financialController.getCorrespondentPayments.bind(financialController));
router.put("/correspondent/payments/:id/status", (0, authMiddleware_1.checkRole)(["correspondent"]), financialController.updatePaymentStatusByCorrespondent.bind(financialController));
// Rotas para administradores
router.get("/summary", (0, authMiddleware_1.checkRole)(["admin", "client", "correspondent"]), financialController.getFinancialSummary.bind(financialController));
router.post("/process-payment", (0, authMiddleware_1.checkRole)(["admin"]), financialController.processPayment.bind(financialController));
exports.default = router;
//# sourceMappingURL=financialRoutes.js.map