"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const userController = new UserController_1.UserController();
// Rotas protegidas
router.use(authMiddleware_1.authMiddleware);
// Rotas para administradores
router.get("/", (0, authMiddleware_1.checkRole)(["admin"]), userController.getAllUsers);
router.post("/", (0, authMiddleware_1.checkRole)(["admin"]), userController.createUser);
router.get("/correspondents", (0, authMiddleware_1.checkRole)(["admin"]), userController.getCorrespondents);
router.get("/correspondents/pending", (0, authMiddleware_1.checkRole)(["admin"]), userController.getPendingCorrespondents);
router.patch("/correspondents/:id/approve", (0, authMiddleware_1.checkRole)(["admin"]), userController.approveCorrespondent);
router.patch("/correspondents/:id/reject", (0, authMiddleware_1.checkRole)(["admin"]), userController.rejectCorrespondent);
// Rotas para todos os usuários autenticados
router.get("/profile", userController.getProfile);
router.patch("/profile", userController.updateProfile);
router.get("/:id", userController.getUserById);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map