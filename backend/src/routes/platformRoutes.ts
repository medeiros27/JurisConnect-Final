import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/platform/analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    console.log('📊 Requisição para /api/platform/analytics');
    
    // Dados mockados realistas para analytics
    const analytics = {
      totalUsers: 89,
      totalDiligences: 156,
      completedDiligences: 142,
      pendingDiligences: 14,
      totalRevenue: 45000,
      averageRating: 4.7,
      responseTime: 18.5,
      conversionRate: 91.0,
      userGrowth: 15.3,
      revenueGrowth: 22.8,
      satisfactionScore: 4.6,
      activeUsers: 67
    };

    res.status(200).json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar os analytics'
    });
  }
});

// GET /api/platform/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    console.log('📊 Requisição para /api/platform/stats');
    
    // Dados mockados para stats gerais
    const stats = {
      totalDiligences: 156,
      activeDiligences: 23,
      completedDiligences: 133,
      totalUsers: 89,
      activeCorrespondents: 12,
      totalRevenue: 45000,
      monthlyProfit: 12500,
      growthRate: 15.3
    };

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar as estatísticas'
    });
  }
});

// GET /api/platform/recent-diligences
router.get('/recent-diligences', async (req: Request, res: Response) => {
  try {
    console.log('📊 Requisição para /api/platform/recent-diligences');
    
    // Dados mockados para diligências recentes
    const recentDiligences = [
      {
        id: '1',
        title: 'Diligência Comercial - Empresa ABC',
        status: 'completed',
        clientName: 'João Silva',
        correspondentName: 'Maria Santos',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Verificação de Endereço',
        status: 'in_progress',
        clientName: 'Ana Costa',
        correspondentName: 'Pedro Oliveira',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        title: 'Diligência Judicial',
        status: 'pending',
        clientName: 'Carlos Mendes',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: '4',
        title: 'Investigação Patrimonial',
        status: 'completed',
        clientName: 'Empresa XYZ Ltda',
        correspondentName: 'Ana Rodrigues',
        createdAt: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: '5',
        title: 'Citação Judicial',
        status: 'in_progress',
        clientName: 'Marcos Pereira',
        correspondentName: 'José Santos',
        createdAt: new Date(Date.now() - 345600000).toISOString()
      }
    ];

    res.status(200).json({
      success: true,
      data: recentDiligences,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar diligências recentes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar as diligências recentes'
    });
  }
});

export default router;

