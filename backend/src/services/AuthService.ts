import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  // Configurações JWT com valores padrão seguros
  private getJWTSecret(): string {
    return process.env.JWT_SECRET || "jurisconnect_secret_key_2024_super_secure";
  }

  private getJWTExpiresIn(): StringValue | number {
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    // Se for um número, converter para number, senão manter como string
    if (/^\d+$/.test(expiresIn)) {
      return parseInt(expiresIn);
    }
    return expiresIn as StringValue;
  }

  async login(email: string, password: string) {
    try {
      // Buscar usuário por email
      const user = await this.userRepository.findOne({
        where: { email }
      });

      if (!user) {
        throw new Error("Credenciais inválidas");
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Credenciais inválidas");
      }

      // Gerar token JWT
      const tokenPayload = {
        id: user.id,
        role: user.role,
        email: user.email
      };

      const jwtSecret = this.getJWTSecret();
      const jwtExpiresIn = this.getJWTExpiresIn();

      // Usar a assinatura correta do JWT
      const token = jwt.sign(
        tokenPayload, 
        jwtSecret, 
        { 
          expiresIn: jwtExpiresIn
        }
      );

      // Remover senha do retorno
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      };

      return {
        user: userResponse,
        token,
        message: "Login realizado com sucesso"
      };

    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    try {
      // Verificar se email já existe
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error("Email já cadastrado");
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Criar usuário
      const user = this.userRepository.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role as any,
        status: "active" as any
      });

      const savedUser = await this.userRepository.save(user);

      // Resposta sem senha
      const userResponse = {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status
      };

      return {
        user: userResponse,
        message: "Usuário criado com sucesso"
      };

    } catch (error) {
      console.error("Erro no registro:", error);
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      // Resposta sem senha
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      };

      return userResponse;

    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      throw error;
    }
  }

  verifyToken(token: string) {
    try {
      const jwtSecret = this.getJWTSecret();
      const decoded = jwt.verify(token, jwtSecret) as any;
      return decoded;
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      throw new Error("Token inválido");
    }
  }

  async refreshToken(userId: string) {
    try {
      const user = await this.getUserProfile(userId);

      const tokenPayload = {
        id: user.id,
        role: user.role,
        email: user.email
      };

      const jwtSecret = this.getJWTSecret();
      const jwtExpiresIn = this.getJWTExpiresIn();

      const token = jwt.sign(
        tokenPayload, 
        jwtSecret, 
        { 
          expiresIn: jwtExpiresIn
        }
      );

      return {
        token,
        user,
        message: "Token renovado com sucesso"
      };

    } catch (error) {
      console.error("Erro ao renovar token:", error);
      throw error;
    }
  }
}

