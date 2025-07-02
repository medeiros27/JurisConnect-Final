import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import userRoutes from './routes/userRoutes';
import diligenceRoutes from './routes/diligenceRoutes';
import authRoutes from './routes/authRoutes';
import platformRoutes from './routes/platformRoutes'; // Nova importação

const app = express();

// Configuração CORS mais permissiva para desenvolvimento
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health checks em múltiplas rotas para compatibilidade
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Backend JurisConnect funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/auth/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Auth service funcionando',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({ 
    status: 'online', 
    service: 'JurisConnect Backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// Health check na raiz também
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'JurisConnect Backend Online',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste simples
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    message: 'API funcionando corretamente!',
    timestamp: new Date().toISOString()
  });
});

// Rotas da aplicação
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/diligences', diligenceRoutes);
app.use('/api/platform', platformRoutes); // Nova rota adicionada

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro na aplicação:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  console.log(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Função para inicializar o servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor JurisConnect...');
    
    // Tentar conectar ao banco de dados
    try {
      await AppDataSource.initialize();
      console.log('✅ Banco de dados conectado com sucesso!');
    } catch (dbError) {
      console.warn('⚠️  Erro ao conectar com o banco de dados:', dbError);
      console.warn('⚠️  Servidor continuará em modo sem banco de dados');
    }

    // Determinar porta - CORREÇÃO DO ERRO TYPESCRIPT
    const PORT: number = parseInt(process.env.PORT || process.env.BACKEND_PORT || '3002', 10);
    
    // Validar se a porta é um número válido
    if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
      throw new Error(`Porta inválida: ${PORT}. Deve ser um número entre 1 e 65535.`);
    }
    
    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🎉 ===================================');
      console.log('🎉 JURISCONNECT BACKEND INICIADO!');
      console.log('🎉 ===================================');
      console.log(`🌐 Servidor rodando em: http://localhost:${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth Health: http://localhost:${PORT}/api/auth/health`);
      console.log('');
      console.log('📋 Rotas disponíveis:');
      console.log('   GET  /api/health');
      console.log('   GET  /api/auth/health');
      console.log('   GET  /api/status');
      console.log('   GET  /api/ping');
      console.log('   POST /api/auth/login');
      console.log('   GET  /api/users');
      console.log('   GET  /api/diligences');
      console.log('   GET  /api/platform/analytics');
      console.log('   GET  /api/platform/stats');
      console.log('   GET  /api/platform/recent-diligences');
      console.log('');
      console.log('🔧 Para testar a conexão:');
      console.log(`   curl http://localhost:${PORT}/api/health`);
      console.log(`   curl http://localhost:${PORT}/api/platform/analytics`);
      console.log('');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Recebido SIGTERM, encerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 Recebido SIGINT, encerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

export default app;

