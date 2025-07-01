import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";

// Importar apenas as rotas que sabemos que funcionam
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import diligenceRoutes from "./routes/diligenceRoutes";
import financialRoutes from "./routes/financialRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import platformRoutes from "./routes/platformRoutes";

// Importar middleware de erro
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// Configuração de CORS para produção
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://jurisconnect-frontend.vercel.app',
        'https://jurisconnect.vercel.app',
        'https://jurisconnect-app.vercel.app'
      ]
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares básicos
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log das requisições (simplificado para produção)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Rota de health check
app.get("/", (req, res) => {
  res.json({ 
    message: "JurisConnect API está funcionando!", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota específica de health para monitoramento
app.get("/health", (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'JurisConnect Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/diligences", diligenceRoutes);
app.use("/api/financial", financialRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/platform", platformRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Inicializar banco de dados e servidor
async function startServer() {
  try {
    console.log("🔄 Inicializando conexão com o banco de dados...");
    await AppDataSource.initialize();
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso.");

    // Sincronizar apenas em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      await AppDataSource.synchronize();
      console.log("✅ Estrutura do banco sincronizada.");
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Acesse: http://localhost:${PORT}`);
      console.log(`📊 API Base: http://localhost:${PORT}/api`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("❌ Erro ao inicializar servidor:", error);
    process.exit(1);
  }
}

startServer();

