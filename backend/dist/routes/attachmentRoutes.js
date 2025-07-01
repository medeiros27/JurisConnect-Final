"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentRoutes = void 0;
const express_1 = require("express");
const AttachmentController_1 = require("../controllers/AttachmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
exports.attachmentRoutes = router;
const attachmentController = new AttachmentController_1.AttachmentController();
// Todas as rotas de anexos requerem autenticação
router.use(authMiddleware_1.authMiddleware);
router.post("/:diligenceId", attachmentController.uploadAttachment);
router.get("/:diligenceId", attachmentController.getDiligenceAttachments);
router.delete("/:id", attachmentController.deleteAttachment);
//# sourceMappingURL=attachmentRoutes.js.map