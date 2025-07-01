import { Router } from "express";
import { FinancialController } from "../controllers/FinancialController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";

const router = Router();
const financialController = new FinancialController();

// Middleware de autenticação para todas as rotas financeiras
router.use(authMiddleware);

// Rotas para clientes
router.post(
  "/proof/upload",
  checkRole(["client"]),
  financialController.uploadPaymentProof.bind(financialController)
);

router.get(
  "/proof/diligence/:diligenceId",
  checkRole(["client", "correspondent", "admin"]),
  financialController.getPaymentProofByDiligenceId.bind(financialController)
);

// Rotas para correspondentes
router.get(
  "/correspondent/payments",
  checkRole(["correspondent"]),
  financialController.getCorrespondentPayments.bind(financialController)
);

router.put(
  "/correspondent/payments/:id/status",
  checkRole(["correspondent"]),
  financialController.updatePaymentStatusByCorrespondent.bind(financialController)
);

// Rotas para administradores
router.get(
  "/summary",
  checkRole(["admin", "client", "correspondent"]),
  financialController.getFinancialSummary.bind(financialController)
);

router.post(
  "/process-payment",
  checkRole(["admin"]),
  financialController.processPayment.bind(financialController)
);

export default router;

