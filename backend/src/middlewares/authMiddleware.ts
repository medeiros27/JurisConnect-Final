import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";
import { UserRepository } from "../repositories/UserRepository";
import { AppDataSource } from "../data-source";

// Definir o tipo para a carga útil do token
interface TokenPayload {
  id: string;
  role: 'admin' | 'client' | 'correspondent';
  iat: number;
  exp: number;
}

// Definir um tipo personalizado para o usuário autenticado
export interface AuthUser {
  id: string;
  role: 'admin' | 'client' | 'correspondent';
}

// Estender o namespace Express para adicionar a propriedade user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Interface para requisições autenticadas (para compatibilidade)
export interface IAuthRequest extends Request {
  user?: AuthUser;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Token não fornecido", 401);
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
      throw new AppError("Token não fornecido", 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "jurisconnect_secret_key_2024_super_secure_muito_longa_e_complexa"
    ) as TokenPayload;

    // Verificar se o AppDataSource está inicializado
    if (!UserRepository.canUseRepository()) {
      console.warn("⚠️ AppDataSource não inicializado, usando validação básica do token");
      
      // Validação básica apenas com o token (para modo demo)
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
      
      return next();
    }

    // Validação completa com banco de dados
    const userRepository = UserRepository.getSafeRepository();
    
    if (!userRepository) {
      console.warn("⚠️ Não foi possível criar UserRepository, usando validação básica do token");
      
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
      
      return next();
    }
    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      throw new AppError("Usuário não encontrado", 401);
    }

    if (user.status !== "active") {
      throw new AppError("Usuário inativo ou pendente", 401);
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      id: user.id,
      role: user.role as 'admin' | 'client' | 'correspondent',
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Token inválido", 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Token expirado", 401);
    }
    if (error instanceof AppError) {
      throw error;
    }
    
    console.error("Erro no middleware de autenticação:", error);
    throw new AppError("Erro interno de autenticação", 500);
  }
};

export const checkRole = (roles: Array<'admin' | 'client' | 'correspondent'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Não autorizado", 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError("Permissão negada", 403);
    }

    return next();
  };
};

