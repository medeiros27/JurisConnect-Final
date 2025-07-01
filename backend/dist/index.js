"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const data_source_1 = require("./data-source");
// Importar apenas as rotas que sabemos que funcionam
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const diligenceRoutes_1 = __importDefault(require("./routes/diligenceRoutes"));
const financialRoutes_1 = __importDefault(require("./routes/financialRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const platformRoutes_1 = __importDefault(require("./routes/platformRoutes"));
// Importar middleware de erro
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
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
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
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
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/diligences", diligenceRoutes_1.default);
app.use("/api/financial", financialRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.use("/api/platform", platformRoutes_1.default);
// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler_1.errorHandler);
// Inicializar banco de dados e servidor
async function startServer() {
    try {
        console.log("🔄 Inicializando conexão com o banco de dados...");
        await data_source_1.AppDataSource.initialize();
        console.log("✅ Conexão com o banco de dados estabelecida com sucesso.");
        // Sincronizar apenas em desenvolvimento
        if (process.env.NODE_ENV !== 'production') {
            await data_source_1.AppDataSource.synchronize();
            console.log("✅ Estrutura do banco sincronizada.");
        }
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📍 Acesse: http://localhost:${PORT}`);
            console.log(`📊 API Base: http://localhost:${PORT}/api`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error("❌ Erro ao inicializar servidor:", error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map