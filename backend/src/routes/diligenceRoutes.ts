import { Router, Response, NextFunction } from "express";
import { DiligenceController } from "../controllers/DiligenceController";
// A importação da interface IAuthRequest é necessária para o 'req.user'
import { authMiddleware, checkRole, IAuthRequest } from "../middlewares/authMiddleware";

const router = Router();
const diligenceController = new DiligenceController();

// Middleware de autenticação para todas as rotas de diligência
router.use(authMiddleware);

// --- CORREÇÃO ---
// Rota principal GET /api/diligences
// Redireciona para a rota apropriada com base na role do usuário
router.get("/", (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (userRole === 'admin') {
        // Se for admin, busca todas as diligências (passando apenas req e res)
        return diligenceController.getAllDiligences(req, res);
    }
    if (userRole === 'client' || userRole === 'correspondent') {
        // Se for cliente ou correspondente, busca as suas próprias diligências (passando apenas req e res)
        return diligenceController.getMyDiligences(req, res);
    }
    // Se não tiver uma role válida, nega o acesso
    return res.status(403).json({ message: "Role de usuário inválida para esta operação." });
});


// Rotas para Admin e Cliente
router.post(
  "/",
  checkRole(["admin", "client"]),
  diligenceController.createDiligence
);
router.get(
  "/client/my-diligences",
  checkRole(["client"]),
  diligenceController.getMyDiligences
);

// Rotas específicas para correspondentes
router.get(
  "/correspondent/my-diligences",
  checkRole(["correspondent"]),
  diligenceController.getMyDiligences
);
router.get(
  "/available",
  checkRole(["correspondent"]),
  diligenceController.getAvailableDiligences
);

// Rotas para Admin (gerenciamento geral)
router.get(
  "/all",
  checkRole(["admin"]),
  diligenceController.getAllDiligences
);

// Rotas para todos os usuários autenticados (visualização de detalhes)
router.get(
  "/:id",
  diligenceController.getDiligenceById
);

// Rotas para atualização de status e atribuição (mantidas como estavam)
router.put("/:id/assign", checkRole(["admin"]), diligenceController.assignDiligence);
router.put("/:id/accept", checkRole(["correspondent"]), diligenceController.acceptDiligence);
router.put("/:id/start", checkRole(["correspondent"]), diligenceController.startDiligence);
router.put("/:id/complete", checkRole(["correspondent"]), diligenceController.completeDiligence);
router.put("/:id/status", checkRole(["admin", "client", "correspondent"]), diligenceController.updateStatus);
router.get("/:id/history", diligenceController.getStatusHistory);

export default router;
