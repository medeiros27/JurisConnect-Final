import { AppDataSource } from "../data-source";
import { StatusHistory } from "../entities/StatusHistory";
import { Repository } from "typeorm";

export class StatusHistoryRepository extends Repository<StatusHistory> {
  constructor() {
    // Verificar se o AppDataSource está inicializado antes de criar o repositório
    if (!AppDataSource.isInitialized) {
      throw new Error("AppDataSource não está inicializado. Certifique-se de que o banco de dados foi conectado.");
    }
    super(StatusHistory, AppDataSource.manager);
  }

  // Renomeado de 'create' para 'createStatusHistory' para evitar conflito com o método base do TypeORM
  async createStatusHistory(statusHistoryData: Partial<StatusHistory>): Promise<StatusHistory> {
    const statusHistory = this.create(statusHistoryData); // Usa o método 'create' da classe base Repository
    return this.save(statusHistory); // Usa o método 'save' da classe base Repository
  }

  async findByDiligenceId(diligenceId: string): Promise<StatusHistory[]> {
    return this.find({
      where: {
        diligenceId,
        entityType: "diligence",
      },
      relations: ["user"],
      order: {
        timestamp: "DESC",
      },
    });
  }

  async findByPaymentId(paymentId: string): Promise<StatusHistory[]> {
    return this.find({
      where: {
        paymentId,
        entityType: "payment",
      },
      relations: ["user"],
      order: {
        timestamp: "DESC",
      },
    });
  }

  async findAll(): Promise<StatusHistory[]> {
    return this.find();
  }

  // Método estático para verificar se o repositório pode ser usado
  static canUseRepository(): boolean {
    return AppDataSource.isInitialized;
  }

  // Método estático para obter o repositório de forma segura
  static getSafeRepository(): StatusHistoryRepository | null {
    try {
      if (AppDataSource.isInitialized) {
        return new StatusHistoryRepository();
      }
      return null;
    } catch (error) {
      console.error("Erro ao criar StatusHistoryRepository:", error);
      return null;
    }
  }
}

