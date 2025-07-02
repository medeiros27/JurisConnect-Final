
import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../controllers/UserController";
// CORREÇÃO: Importamos apenas o 'authMiddleware' por enquanto.
import { authMiddleware } from "../middlewares/authMiddleware";

// --- SOLUÇÃO: Definindo a função 'checkRole' aqui ---
// Esta função cria e retorna um middleware. É o padrão correto para este caso.
const checkRole = (roles: Array<"admin" | "client" | "correspondent">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Assumimos que 'authMiddleware' já adicionou o 'user' ao 'req'.
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Acesso negado. Permissões insuficientes." });
    }

    next();
  };
};
// O ideal é mover esta função 'checkRole' para o seu ficheiro authMiddleware.ts e exportá-la.
// ----------------------------------------------------

const router = Router();
const userController = new UserController();

// Rotas protegidas
router.use(authMiddleware);

// Rotas para administradores, agora usando a função 'checkRole' correta.
router.get("/", checkRole(["admin"]), userController.getAllUsers);
router.post("/", checkRole(["admin"]), userController.createUser);
router.get("/correspondents", checkRole(["admin"]), userController.getCorrespondents);
router.get("/correspondents/pending", checkRole(["admin"]), userController.getPendingCorrespondents);
router.patch("/correspondents/:id/approve", checkRole(["admin"]), userController.approveCorrespondent);
router.patch("/correspondents/:id/reject", checkRole(["admin"]), userController.rejectCorrespondent);

// Rotas para todos os usuários autenticados
router.get("/profile", userController.getProfile);
router.patch("/profile", userController.updateProfile);
router.get("/:id", userController.getUserById);

export default router;