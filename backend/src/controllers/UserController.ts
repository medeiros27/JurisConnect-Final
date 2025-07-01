import { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../middlewares/errorHandler";
import { User } from "../entities/User";
import { IAuthRequest } from "../middlewares/authMiddleware";

export class UserController {
  // Remover a instanciação no construtor
  private getUserRepository(): UserRepository {
    // Usar o método seguro para obter o repositório
    const repository = UserRepository.getSafeRepository();
    if (!repository) {
      throw new AppError("Banco de dados não disponível", 500);
    }
    return repository;
  }

  getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    const userRepository = this.getUserRepository();
    const users = await userRepository.find();
    return res.json(users);
  };

  getUserById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userRepository = this.getUserRepository();
    const user = await userRepository.findOneBy({ id });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return res.json(user);
  };

  createUser = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, password, role, phone, cnpj, state, city } = req.body;
    
    const userRepository = this.getUserRepository();
    
    // Verificar se o usuário já existe
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError("Email já está em uso", 400);
    }

    // Criar novo usuário
    const user = userRepository.create({
      name,
      email,
      password, // A senha deve ser hasheada no service ou antes de salvar
      role,
      phone,
      cnpj,
      state,
      city,
      status: role === "correspondent" ? "pending" : "active"
    });

    await userRepository.save(user);

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);
  };

  updateUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const updateData = req.body;
    
    const userRepository = this.getUserRepository();
    
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Atualizar dados do usuário
    Object.assign(user, updateData);
    await userRepository.save(user);

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  };

  deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    
    const userRepository = this.getUserRepository();
    
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    await userRepository.remove(user);
    return res.status(204).send();
  };

  getProfile = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const userRepository = this.getUserRepository();
    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  };

  updateProfile = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    const { name, phone, state, city } = req.body;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const userRepository = this.getUserRepository();
    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Atualizar apenas campos permitidos
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.state = state || user.state;
    user.city = city || user.city;

    await userRepository.save(user);

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  };

  getCorrespondents = async (req: Request, res: Response): Promise<Response> => {
    const { state, city } = req.query;
    
    const userRepository = this.getUserRepository();
    const correspondents = await userRepository.findCorrespondents(
      state as string,
      city as string
    );

    return res.json(correspondents);
  };

  getPendingCorrespondents = async (req: Request, res: Response): Promise<Response> => {
    const userRepository = this.getUserRepository();
    const pendingCorrespondents = await userRepository.findPendingCorrespondents();
    return res.json(pendingCorrespondents);
  };

  approveCorrespondent = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    
    const userRepository = this.getUserRepository();
    const correspondent = await userRepository.findOneBy({ id });

    if (!correspondent) {
      throw new AppError("Correspondente não encontrado", 404);
    }

    if (correspondent.role !== "correspondent") {
      throw new AppError("Usuário não é um correspondente", 400);
    }

    correspondent.status = "active";
    await userRepository.save(correspondent);

    return res.json({ message: "Correspondente aprovado com sucesso" });
  };

  rejectCorrespondent = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    
    const userRepository = this.getUserRepository();
    const correspondent = await userRepository.findOneBy({ id });

    if (!correspondent) {
      throw new AppError("Correspondente não encontrado", 404);
    }

    if (correspondent.role !== "correspondent") {
      throw new AppError("Usuário não é um correspondente", 400);
    }

    correspondent.status = "rejected";
    await userRepository.save(correspondent);

    return res.json({ message: "Correspondente rejeitado" });
  };
}

