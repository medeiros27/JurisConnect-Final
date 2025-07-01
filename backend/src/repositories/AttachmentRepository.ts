import { AppDataSource } from "../data-source";
import { Attachment } from "../entities/Attachment";
import { Repository, DeleteResult } from "typeorm";
import { AppError } from "../middlewares/errorHandler";

export class AttachmentRepository extends Repository<Attachment> {
  constructor() {
    super(Attachment, AppDataSource.manager);
  }

  async createAttachment(attachmentData: Partial<Attachment>): Promise<Attachment> {
    const attachment = this.create(attachmentData);
    return this.save(attachment);
  }

  async findById(id: string): Promise<Attachment | null> {
    return this.findOne({
      where: { id },
      relations: ["diligence", "uploadedBy"],
    });
  }

  async findByDiligence(diligenceId: string): Promise<Attachment[]> {
    return this.find({
      where: { diligenceId },
      relations: ["uploadedBy"],
      order: { uploadedAt: "DESC" },
    });
  }

  async deleteAttachment(id: string): Promise<DeleteResult> {
    const result = await super.delete(id);
    if (result.affected === 0) {
      throw new AppError("Anexo não encontrado para exclusão", 404);
    }
    return result;
  }
}

