"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentRepository = void 0;
const data_source_1 = require("../data-source");
const Attachment_1 = require("../entities/Attachment");
const typeorm_1 = require("typeorm");
const errorHandler_1 = require("../middlewares/errorHandler");
class AttachmentRepository extends typeorm_1.Repository {
    constructor() {
        super(Attachment_1.Attachment, data_source_1.AppDataSource.manager);
    }
    async createAttachment(attachmentData) {
        const attachment = this.create(attachmentData);
        return this.save(attachment);
    }
    async findById(id) {
        return this.findOne({
            where: { id },
            relations: ["diligence", "uploadedBy"],
        });
    }
    async findByDiligence(diligenceId) {
        return this.find({
            where: { diligenceId },
            relations: ["uploadedBy"],
            order: { uploadedAt: "DESC" },
        });
    }
    async deleteAttachment(id) {
        const result = await super.delete(id);
        if (result.affected === 0) {
            throw new errorHandler_1.AppError("Anexo não encontrado para exclusão", 404);
        }
        return result;
    }
}
exports.AttachmentRepository = AttachmentRepository;
//# sourceMappingURL=AttachmentRepository.js.map