"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PlatformController_1 = require("../controllers/PlatformController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const platformController = new PlatformController_1.PlatformController();
// Apenas administradores podem aceder às análises da plataforma
router.get('/analytics', authMiddleware_1.authMiddleware, (0, authMiddleware_1.checkRole)(['admin']), platformController.getAnalytics);
exports.default = router;
//# sourceMappingURL=platformRoutes.js.map