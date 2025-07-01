"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000');
// Dados mockados para demonstração
const mockUsers = [
    {
        id: "1",
        name: "Administrador",
        email: "admin@jurisconnect.com",
        password: "$2a$12$PYkmVYxW7HmKL45JkuYa9OzbFNQGfTeknwuHreXdDhP0Bxhm6rv72", // admin123
        role: "admin",
        phone: "(11) 99999-9999",
        cpf: "123.456.789-00",
        status: "active"
    },
    {
        id: "2",
        name: "Cliente Exemplo",
        email: "cliente@exemplo.com",
        password: "$2a$12$wh.agsGuNI1d5Tm3BLeCkuWvuCyKKR1ShosNKckpxVSsYuUK8UxjS", // cliente123
        role: "client",
        phone: "(11) 88888-8888",
        cpf: "987.654.321-00",
        status: "active"
    },
    {
        id: "3",
        name: "Correspondente Jurídico",
        email: "correspondente@exemplo.com",
        password: "$2a$12$AJ10RHowhrtVT/ILJttLP.Y2hKeomMfNiv.4xBjHLYIg65x1nvFVS", // corresp123
        role: "correspondent",
        phone: "(11) 77777-7777",
        cpf: "456.789.123-00",
        status: "active"
    }
];
// Configuração de CORS
const corsOptions = {
    origin: [
        'https://zuphrmxo.manus.space',
        'https://bieabfzb.manus.space',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
// Middlewares
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Log das requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
// Rota principal
app.get("/", (req, res) => {
    res.json({
        message: "JurisConnect API está funcionando!",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: "demo",
        database: "Mock Data"
    });
});
// Rota de health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'JurisConnect Backend',
        version: '1.0.0',
        environment: 'demo'
    });
});
// Rota de health check da API
app.get("/api/auth/health", (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'JurisConnect Backend',
        version: '1.0.0',
        environment: 'demo'
    });
});
// Rota de login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Buscar usuário
        const user = mockUsers.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }
        // Verificar senha
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }
        // Gerar token JWT
        const secret = "jurisconnect_demo_secret_2024";
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            role: user.role,
            email: user.email
        }, secret, { expiresIn: "7d" });
        // Remover senha do objeto retornado
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            user: userWithoutPassword,
            token,
            message: "Login realizado com sucesso"
        });
    }
    catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
});
// Rota para buscar perfil
app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Token não fornecido" });
    }
    try {
        const token = authHeader.replace('Bearer ', '');
        const secret = "jurisconnect_demo_secret_2024";
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = mockUsers.find(u => u.id === decoded.id);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    }
    catch (error) {
        res.status(401).json({ message: "Token inválido" });
    }
});
// Rotas de dados mockados
app.get("/api/platform/analytics", (req, res) => {
    res.json({
        totalDiligences: 156,
        activeDiligences: 23,
        completedDiligences: 133,
        totalRevenue: 45600.00,
        monthlyRevenue: 8900.00,
        activeCorrespondents: 12,
        pendingPayments: 5
    });
});
app.get("/api/financial/summary", (req, res) => {
    res.json({
        totalReceived: 35600.00,
        totalPending: 10000.00,
        monthlyRevenue: 8900.00,
        recentTransactions: [
            {
                id: "1",
                description: "Pagamento de diligência #123",
                amount: 500.00,
                date: new Date().toISOString(),
                status: "completed"
            },
            {
                id: "2",
                description: "Pagamento de diligência #124",
                amount: 750.00,
                date: new Date().toISOString(),
                status: "pending"
            }
        ]
    });
});
app.get("/api/diligences", (req, res) => {
    res.json([
        {
            id: "1",
            title: "Citação Judicial - Processo 123456",
            status: "in_progress",
            client: "Escritório Silva & Associados",
            correspondent: "João Correspondente",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            value: 500.00
        },
        {
            id: "2",
            title: "Intimação - Processo 789012",
            status: "completed",
            client: "Advocacia Santos",
            correspondent: "Maria Correspondente",
            deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            value: 300.00
        }
    ]);
});
app.get("/api/notifications", (req, res) => {
    res.json([
        {
            id: "1",
            title: "Nova diligência atribuída",
            message: "Você recebeu uma nova diligência para execução",
            type: "info",
            read: false,
            createdAt: new Date().toISOString()
        },
        {
            id: "2",
            title: "Pagamento processado",
            message: "Pagamento de R$ 500,00 foi processado com sucesso",
            type: "success",
            read: false,
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        }
    ]);
});
// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    console.error("Erro:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
});
// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor JurisConnect Demo rodando na porta ${PORT}`);
    console.log(`📍 Acesse: http://localhost:${PORT}`);
    console.log(`📊 API Base: http://localhost:${PORT}/api`);
    console.log(`🌍 Ambiente: demo`);
    console.log(`💾 Dados: Mock/Demonstração`);
    console.log(`✅ Pronto para receber requisições!`);
});
//# sourceMappingURL=index-demo.js.map