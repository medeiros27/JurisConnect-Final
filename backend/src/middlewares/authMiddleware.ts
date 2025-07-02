import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

// Interface para o payload do JWT
// CORREÇÃO: A chave no token é 'id', não 'userId'
interface JwtPayload {
  id: string; // Alterado de userId para id
  email: string;
  role?: string;
}

// Exporta a interface para a requisição autenticada.
export interface IAuthRequest extends Request {
  user?: User;
}

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura';

// Middleware de autenticação principal
export const authMiddleware = async (req: IAuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Acesso negado. Token não fornecido ou malformatado.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // CORREÇÃO: Verificar 'decoded.id' em vez de 'decoded.userId'
    if (!decoded.id) {
      res.status(401).json({ message: 'Token inválido: ID do usuário ausente no payload.' });
      return;
    }

    // CORREÇÃO: Usar 'decoded.id' para buscar o usuário
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: decoded.id });

    if (!user) {
      res.status(401).json({ message: 'Usuário do token não encontrado no banco de dados.' });
      return;
    }
    
    if (user.status !== 'active') {
        res.status(401).json({ message: 'Sua conta foi desativada.' });
        return;
    }

    req.user = user;
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
        console.error(`[Auth] Erro de Token JWT: ${error.message}`, { name: error.name });
        res.status(401).json({ message: `Token inválido: ${error.message}` });
        return;
    }
    console.error('[Auth] Erro inesperado no middleware:', error);
    res.status(500).json({ message: 'Erro interno no servidor de autenticação.' });
  }
};

// Middleware para verificar roles (cargos)
export const checkRole = (allowedRoles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ message: 'Acesso negado. Permissões insuficientes.' });
      return;
    }
    next();
  };
};
