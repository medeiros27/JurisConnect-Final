"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const data_source_sqlite_1 = require("./data-source-sqlite");
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
    origin: [
        'https://bieabfzb.manus.space',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
// Middlewares básicos
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Log das requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
// Rota de health check
app.get("/", (req, res) => {
    res.json({
        message: "JurisConnect API está funcionando!",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: "production",
        database: "SQLite"
    });
});
// Rota específica de health para monitoramento
app.get("/health", (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'JurisConnect Backend',
        version: '1.0.0',
        environment: 'production',
        database: 'SQLite'
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
        console.log("🔄 Inicializando conexão com SQLite...");
        await data_source_sqlite_1.AppDataSource.initialize();
        console.log("✅ Conexão com SQLite estabelecida com sucesso.");
        // Sincronizar estrutura do banco
        await data_source_sqlite_1.AppDataSource.synchronize();
        console.log("✅ Estrutura do banco sincronizada.");
        // Criar usuários padrão se não existirem
        await createDefaultUsers();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📍 Acesse: http://localhost:${PORT}`);
            console.log(`📊 API Base: http://localhost:${PORT}/api`);
            console.log(`🌍 Ambiente: production`);
            console.log(`💾 Banco: SQLite`);
        });
    }
    catch (error) {
        console.error("❌ Erro ao inicializar servidor:", error);
        process.exit(1);
    }
}
// Função para criar usuários padrão
async function createDefaultUsers() {
    try {
        const userRepository = data_source_sqlite_1.AppDataSource.getRepository("User");
        const userCount = await userRepository.count();
        if (userCount === 0) {
            console.log("🔄 Criando usuários padrão...");
            const bcrypt = require("bcryptjs");
            const users = [
                {
                    name: "Administrador",
                    email: "admin@jurisconnect.com",
                    password: await bcrypt.hash("admin123", 12),
                    role: "admin",
                    phone: "(11) 99999-9999",
                    cpf: "123.456.789-00",
                    status: "active",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: "Cliente Exemplo",
                    email: "cliente@exemplo.com",
                    password: await bcrypt.hash("cliente123", 12),
                    role: "client",
                    phone: "(11) 88888-8888",
                    cpf: "987.654.321-00",
                    status: "active",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                {
                    name: "Correspondente Jurídico",
                    email: "correspondente@exemplo.com",
                    password: await bcrypt.hash("corresp123", 12),
                    role: "correspondent",
                    phone: "(11) 77777-7777",
                    cpf: "456.789.123-00",
                    address: "Rua dos Advogados, 123",
                    city: "São Paulo",
                    state: "SP",
                    zipCode: "01234-567",
                    status: "active",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ];
            for (const userData of users) {
                const user = userRepository.create(userData);
                await userRepository.save(user);
                console.log(`✅ Usuário criado: ${userData.name}`);
            }
            console.log("✅ Usuários padrão criados com sucesso!");
        }
    }
    catch (error) {
        console.error("❌ Erro ao criar usuários padrão:", error);
    }
}
startServer();
//# sourceMappingURL=index-deploy.js.map