import { Request, Response } from "express";
import { DiligenceRepository } from "../repositories/DiligenceRepository";
import { UserRepository } from "../repositories/UserRepository";
import { StatusHistoryRepository } from "../repositories/StatusHistoryRepository";
import { AppError } from "../middlewares/errorHandler";
import { IAuthRequest } from "../middlewares/authMiddleware";

// Importar as instâncias de serviço
import diligenceService from "../services/diligenceService";
import statusManagementService from "../services/statusManagementService";

const ALLOWED_DILIGENCE_STATUSES = ["pending", "assigned", "in_progress", "completed", "cancelled", "disputed"];

export class DiligenceController {
  // Remover instanciação no construtor e usar lazy loading
  private getDiligenceRepository(): DiligenceRepository {
    const repository = DiligenceRepository.getSafeRepository();
    if (!repository) {
      throw new AppError("Banco de dados não disponível", 500);
    }
    return repository;
  }

  private getUserRepository(): UserRepository {
    const repository = UserRepository.getSafeRepository();
    if (!repository) {
      throw new AppError("Banco de dados não disponível", 500);
    }
    return repository;
  }

  private getStatusHistoryRepository(): StatusHistoryRepository {
    const repository = StatusHistoryRepository.getSafeRepository();
    if (!repository) {
      throw new AppError("Banco de dados não disponível", 500);
    }
    return repository;
  }

  getAllDiligences = async (req: Request, res: Response): Promise<Response> => {
    const diligenceRepository = this.getDiligenceRepository();
    const diligences = await diligenceRepository.findAll();
    return res.json(diligences);
  };

  getDiligenceById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const diligenceRepository = this.getDiligenceRepository();
    const diligence = await diligenceRepository.findById(id);

    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    return res.json(diligence);
  };

  createDiligence = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    const diligenceData = req.body;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligenceRepository = this.getDiligenceRepository();
    
    // Adicionar o ID do cliente à diligência
    const newDiligence = await diligenceRepository.createDiligence({
      ...diligenceData,
      clientId: userId,
      status: "pending",
      createdAt: new Date(),
    });

    return res.status(201).json(newDiligence);
  };

  updateDiligence = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const updateData = req.body;

    const diligenceRepository = this.getDiligenceRepository();
    const updatedDiligence = await diligenceRepository.updateDiligence(id, updateData);

    return res.json(updatedDiligence);
  };

  deleteDiligence = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const diligenceRepository = this.getDiligenceRepository();
    await diligenceRepository.deleteDiligence(id);

    return res.status(204).send();
  };

  getMyDiligences = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligenceRepository = this.getDiligenceRepository();
    let diligences;

    if (userRole === "client") {
      diligences = await diligenceRepository.findByClient(userId);
    } else if (userRole === "correspondent") {
      diligences = await diligenceRepository.findByCorrespondent(userId);
    } else {
      throw new AppError("Tipo de usuário não autorizado", 403);
    }

    return res.json(diligences);
  };

  getAvailableDiligences = async (req: Request, res: Response): Promise<Response> => {
    const { state, city } = req.query;

    const diligenceRepository = this.getDiligenceRepository();
    const diligences = await diligenceRepository.findAvailableDiligences(
      state as string,
      city as string
    );

    return res.json(diligences);
  };

  assignDiligence = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { correspondentId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligenceRepository = this.getDiligenceRepository();
    const userRepository = this.getUserRepository();

    // Verificar se a diligência existe
    const diligence = await diligenceRepository.findById(id);
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    // Verificar se o correspondente existe
    const correspondent = await userRepository.findOneBy({ id: correspondentId });
    if (!correspondent || correspondent.role !== "correspondent") {
      throw new AppError("Correspondente não encontrado", 404);
    }

    // Atualizar a diligência
    const updatedDiligence = await diligenceRepository.updateDiligence(id, {
      correspondentId,
      status: "assigned",
    });

    // Registrar no histórico
    const statusHistoryRepository = this.getStatusHistoryRepository();
    await statusHistoryRepository.createStatusHistory({
      diligenceId: id,
      entityType: "diligence",
      previousStatus: diligence.status,
      newStatus: "assigned",
      userId,
      timestamp: new Date(),
      reason: `Diligência atribuída ao correspondente ${correspondent.name}`,
    });

    return res.json(updatedDiligence);
  };

  acceptDiligence = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligenceRepository = this.getDiligenceRepository();
    
    const diligence = await diligenceRepository.findById(id);
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    if (diligence.correspondentId !== userId) {
      throw new AppError("Você não está autorizado a aceitar esta diligência", 403);
    }

    const updatedDiligence = await diligenceRepository.updateDiligence(id, {
      status: "in_progress",
    });

    // Registrar no histórico
    const statusHistoryRepository = this.getStatusHistoryRepository();
    await statusHistoryRepository.createStatusHistory({
      diligenceId: id,
      entityType: "diligence",
      previousStatus: diligence.status,
      newStatus: "in_progress",
      userId,
      timestamp: new Date(),
      reason: "Diligência aceita pelo correspondente",
    });

    return res.json(updatedDiligence);
  };

  startDiligence = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligenceRepository = this.getDiligenceRepository();
    
    const diligence = await diligenceRepository.findById(id);
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    if (diligence.correspondentId !== userId) {
      throw new AppError("Você não está autorizado a iniciar esta diligência", 403);
    }

    const updatedDiligence = await diligenceRepository.updateDiligence(id, {
      status: "in_progress",
    });

    // Registrar no histórico
    const statusHistoryRepository = this.getStatusHistoryRepository();
    await statusHistoryRepository.createStatusHistory({
      diligenceId: id,
      entityType: "diligence",
      previousStatus: diligence.status,
      newStatus: "in_progress",
      userId,
      timestamp: new Date(),
      reason: "Diligência iniciada",
    });

    return res.json(updatedDiligence);
  };

  completeDiligence = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const diligenceRepository = this.getDiligenceRepository();
    
    const diligence = await diligenceRepository.findById(id);
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    if (diligence.correspondentId !== userId) {
      throw new AppError("Você não está autorizado a completar esta diligência", 403);
    }

    const updatedDiligence = await diligenceRepository.updateDiligence(id, {
      status: "completed",
    });

    // Registrar no histórico
    const statusHistoryRepository = this.getStatusHistoryRepository();
    await statusHistoryRepository.createStatusHistory({
      diligenceId: id,
      entityType: "diligence",
      previousStatus: diligence.status,
      newStatus: "completed",
      userId,
      timestamp: new Date(),
      reason: notes || "Diligência concluída",
    });

    return res.json(updatedDiligence);
  };

  updateStatus = async (req: IAuthRequest, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!ALLOWED_DILIGENCE_STATUSES.includes(status)) {
      throw new AppError("Status inválido", 400);
    }

    const diligenceRepository = this.getDiligenceRepository();
    
    const diligence = await diligenceRepository.findById(id);
    if (!diligence) {
      throw new AppError("Diligência não encontrada", 404);
    }

    const updatedDiligence = await diligenceRepository.updateDiligence(id, { status });

    // Registrar no histórico
    const statusHistoryRepository = this.getStatusHistoryRepository();
    await statusHistoryRepository.createStatusHistory({
      diligenceId: id,
      entityType: "diligence",
      previousStatus: diligence.status,
      newStatus: status,
      userId,
      timestamp: new Date(),
      reason: notes || `Status alterado para ${status}`,
    });

    return res.json(updatedDiligence);
  };

  getStatusHistory = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const statusHistoryRepository = this.getStatusHistoryRepository();
    const history = await statusHistoryRepository.findByDiligenceId(id);

    return res.json(history);
  };
}

