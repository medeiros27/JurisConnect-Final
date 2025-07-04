import { AppDataSource } from "../data-source";
import { Diligence } from "../entities/Diligence";
import { Repository, DeleteResult, UpdateResult } from "typeorm";
import { AppError } from "../middlewares/errorHandler";

export class DiligenceRepository extends Repository<Diligence> {
  constructor() {
    // Verificar se o AppDataSource está inicializado antes de criar o repositório
    if (!AppDataSource.isInitialized) {
      throw new Error("AppDataSource não está inicializado. Certifique-se de que o banco de dados foi conectado.");
    }
    super(Diligence, AppDataSource.manager);
  }

  async findAll(): Promise<Diligence[]> {
    return this.find({
      relations: ["client", "correspondent", "attachments", "statusHistory"],
    });
  }

  async findById(id: string): Promise<Diligence | null> {
    return this.findOne({
      where: { id },
      relations: ["client", "correspondent", "attachments", "statusHistory", "paymentProof"],
    });
  }

  // Renomeado de 'create' para 'createDiligence' para evitar conflito com o método base do TypeORM
  async createDiligence(diligenceData: Partial<Diligence>): Promise<Diligence> {
    const diligence = this.create(diligenceData); // Usa o método 'create' da classe base Repository
    return this.save(diligence); // Usa o método 'save' da classe base Repository
  }

  // Renomeado de 'update' para 'updateDiligence' para evitar conflito com o método base do TypeORM
  async updateDiligence(id: string, diligenceData: Partial<Diligence>): Promise<Diligence> {
    const diligence = await this.findById(id); // Usa o método findById personalizado
    
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }
    
    this.merge(diligence, diligenceData); // Usa o método 'merge' da classe base Repository
    return this.save(diligence); // Usa o método 'save' da classe base Repository
  }

  // Renomeado de 'delete' para 'deleteDiligence' para evitar conflito e corrigida a implementação
  async deleteDiligence(id: string): Promise<DeleteResult> { // Retorna DeleteResult
    const result = await super.delete(id); // Chama o método 'delete' da classe pai (Repository)
    if (result.affected === 0) {
      throw new AppError("Diligência não encontrada para exclusão", 404);
    }
    return result;
  }

  async findByClient(clientId: string): Promise<Diligence[]> {
    return this.find({
      where: { clientId },
      relations: ["client", "correspondent", "attachments", "statusHistory"],
    });
  }

  async findByCorrespondent(correspondentId: string): Promise<Diligence[]> {
    return this.find({
      where: { correspondentId },
      relations: ["client", "correspondent", "attachments", "statusHistory"],
    });
  }

  async findAvailableDiligences(state?: string, city?: string): Promise<Diligence[]> {
    const query = this
      .createQueryBuilder("diligence")
      .leftJoinAndSelect("diligence.client", "client")
      .where("diligence.status = :status", { status: "pending" });

    if (state) {
      query.andWhere("diligence.state = :state", { state });
    }

    if (city) {
      query.andWhere("diligence.city ILIKE :city", { city: `%${city}%` });
    }

    return query.getMany();
  }

  // Método estático para verificar se o repositório pode ser usado
  static canUseRepository(): boolean {
    return AppDataSource.isInitialized;
  }

  // Método estático para obter o repositório de forma segura
  static getSafeRepository(): DiligenceRepository | null {
    try {
      if (AppDataSource.isInitialized) {
        return new DiligenceRepository();
      }
      return null;
    } catch (error) {
      console.error("Erro ao criar DiligenceRepository:", error);
      return null;
    }
  }
}

