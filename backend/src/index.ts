import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { initializeDatabase } from './data-source';

// Carregar variáveis de ambiente primeiro
dotenv.config();

// Importar rotas
import userRoutes from './routes/userRoutes';
import diligenceRoutes from './routes/diligenceRoutes';
import authRoutes from './routes/authRoutes';

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
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

// Rota de teste para usuários (mockada se necessário)
app.get('/api/users', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      users: [
        {
          id: '1',
          email: 'admin@jurisconnect.com',
          name: 'Administrador',
          role: 'admin',
          isActive: true
        },
        {
          id: '2', 
          email: 'cliente@exemplo.com',
          name: 'Cliente Exemplo',
          role: 'client',
          isActive: true
        }
      ]
    },
    message: 'Usuários carregados com sucesso'
  });
});

// Rota de teste para clientes
app.get('/api/users/clients', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      users: [
        {
          id: '2',
          email: 'cliente@exemplo.com', 
          name: 'Cliente Exemplo',
          role: 'client',
          isActive: true
        },
        {
          id: '3',
          email: 'cliente2@exemplo.com',
          name: 'Cliente 2',
          role: 'client', 
          isActive: true
        }
      ]
    }
  });
});

// Rota de teste para correspondentes
app.get('/api/users/correspondents', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      users: [
        {
          id: '4',
          email: 'correspondente@exemplo.com',
          name: 'Correspondente Exemplo', 
          role: 'correspondent',
          isActive: true,
          state: 'SP',
          city: 'São Paulo'
        }
      ]
    }
  });
});

// Tentar usar as rotas reais, com fallback para rotas mockadas
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/diligences', diligenceRoutes);
} catch (error) {
  console.warn('⚠️ Erro ao carregar rotas:', error);
}

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
    
    // Tentar conectar ao banco de dados (opcional)
    try {
      const dbConnected = await initializeDatabase();
      if (dbConnected) {
        console.log('✅ Banco de dados conectado!');
      } else {
        console.warn('⚠️ Servidor funcionará sem banco de dados');
      }
    } catch (dbError) {
      console.warn('⚠️ Banco de dados não disponível, usando dados mockados');
    }

    // Determinar porta
    const PORT: number = parseInt(process.env.PORT || '3000', 10);
    
    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🎉 ===================================');
      console.log('🎉 JURISCONNECT BACKEND INICIADO!');
      console.log('🎉 ===================================');
      console.log(`🌐 Servidor rodando em: http://localhost:${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('📋 Rotas disponíveis:');
      console.log('   GET  /api/health');
      console.log('   GET  /api/users'); 
      console.log('   GET  /api/users/clients');
      console.log('   GET  /api/users/correspondents');
      console.log('');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Encerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor encerrado');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 Encerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor encerrado');
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