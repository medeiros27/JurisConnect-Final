"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentController = void 0;
const DiligenceRepository_1 = require("../repositories/DiligenceRepository");
const AttachmentRepository_1 = require("../repositories/AttachmentRepository");
const errorHandler_1 = require("../middlewares/errorHandler");
class AttachmentController {
    constructor() {
        this.uploadAttachment = async (req, res) => {
            const authRequest = req;
            const { diligenceId } = req.params;
            const userId = authRequest.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const diligence = await this.diligenceRepository.findById(diligenceId);
            if (!diligence) {
                throw new errorHandler_1.AppError("Diligência não encontrada", 404);
            }
            if (authRequest.user?.role !== "admin" &&
                diligence.clientId !== userId &&
                diligence.correspondentId !== userId) {
                throw new errorHandler_1.AppError("Acesso negado", 403);
            }
            // Lógica de upload de arquivo (simulada)
            const { name, type, size } = req.body;
            if (!name || !type || !size) {
                throw new errorHandler_1.AppError("Dados do anexo incompletos", 400);
            }
            const url = `https://example.com/attachments/${Date.now()}-${name}`;
            const attachment = await this.attachmentRepository.create({
                name,
                url,
                type,
                size,
                diligenceId,
                uploadedById: userId,
            });
            return res.status(201).json(attachment);
        };
        this.getDiligenceAttachments = async (req, res) => {
            const authRequest = req;
            const { diligenceId } = req.params;
            const userId = authRequest.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const diligence = await this.diligenceRepository.findById(diligenceId);
            if (!diligence) {
                throw new errorHandler_1.AppError("Diligência não encontrada", 404);
            }
            if (authRequest.user?.role !== "admin" &&
                diligence.clientId !== userId &&
                diligence.correspondentId !== userId) {
                throw new errorHandler_1.AppError("Acesso negado", 403);
            }
            const attachments = await this.attachmentRepository.findByDiligence(diligenceId);
            return res.json(attachments);
        };
        this.deleteAttachment = async (req, res) => {
            const authRequest = req;
            const { id } = req.params;
            const userId = authRequest.user?.id;
            if (!userId) {
                throw new errorHandler_1.AppError("Usuário não autenticado", 401);
            }
            const attachment = await this.attachmentRepository.findById(id);
            if (!attachment) {
                throw new errorHandler_1.AppError("Anexo não encontrado", 404);
            }
            const diligence = await this.diligenceRepository.findById(attachment.diligenceId);
            if (!diligence) {
                // Este caso é improvável, mas é uma boa verificação de segurança
                await this.attachmentRepository.delete(id);
                return res.status(204).send();
            }
            if (authRequest.user?.role !== "admin" &&
                diligence.clientId !== userId &&
                attachment.uploadedById !== userId) {
                throw new errorHandler_1.AppError("Acesso negado", 403);
            }
            await this.attachmentRepository.delete(id);
            return res.status(204).send();
        };
        this.diligenceRepository = new DiligenceRepository_1.DiligenceRepository();
        this.attachmentRepository = new AttachmentRepository_1.AttachmentRepository();
    }
}
exports.AttachmentController = AttachmentController;
//# sourceMappingURL=AttachmentController.js.map