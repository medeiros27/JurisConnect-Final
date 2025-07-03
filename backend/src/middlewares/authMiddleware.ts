import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

// Interface para o payload do JWT, garantindo consistência
interface JwtPayload {
  id: string;
  email: string;
  role?: string;
}

// Interface para a requisição autenticada, exportada para ser usada em outros ficheiros
export interface IAuthRequest extends Request {
  user?: User;
}

// Chave secreta do JWT (idealmente, vinda de uma variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-padrao';

/**
 * Middleware principal de autenticação. Verifica o token JWT.
 */
export const authMiddleware = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Acesso negado. Token não fornecido ou malformatado.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.id) {
      res.status(401).json({ message: 'Token inválido: ID do usuário ausente no payload.' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      res.status(401).json({ message: 'Usuário do token não encontrado no banco de dados.' });
      return;
    }
    
    if (user.status !== 'active') {
        res.status(401).json({ message: 'Sua conta foi desativada ou está pendente de aprovação.' });
        return;
    }

    req.user = user; // Anexa o objeto User completo à requisição
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
        console.error(`[Auth] Erro de Token JWT: ${error.message}`);
        res.status(401).json({ message: `Token inválido ou expirado: ${error.message}` });
        return;
    }
    console.error('[Auth] Erro inesperado no middleware:', error);
    res.status(500).json({ message: 'Erro interno no servidor de autenticação.' });
  }
};

/**
 * Middleware factory para verificar roles (cargos) de usuários.
 * @param allowedRoles - Um array de roles que têm permissão.
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: 'Acesso negado. Você não tem permissão para executar esta ação.' });
      return;
    }
    next();
  };
};
