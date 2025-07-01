import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Repository } from "typeorm";

export class UserRepository extends Repository<User> {
  constructor() {
    // Verificar se o AppDataSource está inicializado antes de criar o repositório
    if (!AppDataSource.isInitialized) {
      throw new Error("AppDataSource não está inicializado. Certifique-se de que o banco de dados foi conectado.");
    }
    super(User, AppDataSource.manager);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email })
      .getOne();
  }

  async findCorrespondents(state?: string, city?: string): Promise<User[]> {
    const query = this
      .createQueryBuilder("user")
      .where("user.role = :role", { role: "correspondent" })
      .andWhere("user.status = :status", { status: "active" });

    if (state) {
      query.andWhere("user.state = :state", { state });
    }

    if (city) {
      query.andWhere("user.city ILIKE :city", { city: `%${city}%` });
    }

    return query.getMany();
  }

  async findPendingCorrespondents(): Promise<User[]> {
    return this.find({
      where: {
        role: "correspondent",
        status: "pending",
      },
    });
  }

  // Método estático para verificar se o repositório pode ser usado
  static canUseRepository(): boolean {
    return AppDataSource.isInitialized;
  }

  // Método estático para obter o repositório de forma segura
  static getSafeRepository(): UserRepository | null {
    try {
      if (AppDataSource.isInitialized) {
        return new UserRepository();
      }
      return null;
    } catch (error) {
      console.error("Erro ao criar UserRepository:", error);
      return null;
    }
  }
}

