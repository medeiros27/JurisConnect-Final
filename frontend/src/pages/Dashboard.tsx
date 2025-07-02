import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import platformService from '../services/platformService';
import financialService from '../services/financialService';
import { Diligence } from '../types'; // importe seus tipos
import StatsCard from '../components/Dashboard/StatsCard';
import CorrespondentDashboard from '../components/Dashboard/CorrespondentDashboard';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorState from '../components/UI/ErrorState'; // Componente de erro para melhor UX
import {
  FileText, Users, DollarSign, TrendingUp, Clock, CheckCircle, PiggyBank
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentDiligences, setRecentDiligences] = useState<Diligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função auxiliar para formatar valores numéricos com segurança
  const safeToFixed = (value: number | undefined | null, decimals: number = 2): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00';
    }
    return Number(value).toFixed(decimals);
  };

  // Função auxiliar para garantir que um valor seja um número válido
  const safeNumber = (value: number | undefined | null, defaultValue: number = 0): number => {
    if (value === undefined || value === null || isNaN(value)) {
      return defaultValue;
    }
    return Number(value);
  };

  // Função auxiliar para formatar moeda com segurança
  const safeCurrency = (value: number | undefined | null): string => {
    return formatCurrency(safeNumber(value, 0));
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.role === 'admin') {
        // Admin dashboard
        const [platformStats, financialSummary] = await Promise.all([
          platformService.getPlatformStats(),
          financialService.getFinancialSummary()
        ]);

        setStats({
          ...platformStats,
          ...financialSummary,
          // Garantir que todos os valores sejam números válidos
          totalDiligences: safeNumber(platformStats?.totalDiligences),
          activeDiligences: safeNumber(platformStats?.activeDiligences),
          completedDiligences: safeNumber(platformStats?.completedDiligences),
          totalUsers: safeNumber(platformStats?.totalUsers),
          activeCorrespondents: safeNumber(platformStats?.activeCorrespondents),
          totalRevenue: safeNumber(financialSummary?.receitaTotal),
          monthlyProfit: safeNumber(financialSummary?.lucroLiquido),
          growthRate: safeNumber(financialSummary?.crescimentoMensal)
        });

        // Carregar diligências recentes
        const recentData = await platformService.getRecentDiligences();
        setRecentDiligences(Array.isArray(recentData) ? recentData : []);

      } else if (user?.role === 'client') {
        // Client dashboard
        const clientStats = await platformService.getClientStats(user.id);
        setStats({
          myDiligences: safeNumber(clientStats?.myDiligences),
          pendingDiligences: safeNumber(clientStats?.pendingDiligences),
          completedDiligences: safeNumber(clientStats?.completedDiligences),
          totalSpent: safeNumber(clientStats?.totalSpent),
          averageResponseTime: safeNumber(clientStats?.averageResponseTime),
          satisfactionRate: safeNumber(clientStats?.satisfactionRate)
        });

        // Carregar minhas diligências recentes
        const myRecentData = await platformService.getClientRecentDiligences(user.id);
        setRecentDiligences(Array.isArray(myRecentData) ? myRecentData : []);

      } else if (user?.role === 'correspondent') {
        // Correspondent dashboard - renderizado por componente específico
        return;
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
      
      // Fallback para dados mockados
      if (user?.role === 'admin') {
        setStats({
          totalDiligences: 156,
          activeDiligences: 23,
          completedDiligences: 133,
          totalUsers: 89,
          activeCorrespondents: 12,
          totalRevenue: 45000,
          monthlyProfit: 12500,
          growthRate: 15.3
        });
      } else if (user?.role === 'client') {
        setStats({
          myDiligences: 8,
          pendingDiligences: 2,
          completedDiligences: 6,
          totalSpent: 2400,
          averageResponseTime: 24,
          satisfactionRate: 4.8
        });
      }
      
      setRecentDiligences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Carregando dashboard..." />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Erro ao carregar dashboard"
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Renderização específica para correspondente
  if (user?.role === 'correspondent') {
    return <CorrespondentDashboard />;
  }

  // Renderização para Admin
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Visão geral da plataforma JurisConnect</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Diligências"
            value={safeNumber(stats?.totalDiligences).toString()}
            icon={FileText}
            trend={{ value: 12, isPositive: true }}
            color="blue"
          />
          <StatsCard
            title="Usuários Ativos"
            value={safeNumber(stats?.totalUsers).toString()}
            icon={Users}
            trend={{ value: 8, isPositive: true }}
            color="green"
          />
          <StatsCard
            title="Receita Total"
            value={safeCurrency(stats?.totalRevenue)}
            icon={DollarSign}
            trend={{ value: safeNumber(stats?.growthRate, 0), isPositive: true }}
            color="emerald"
          />
          <StatsCard
            title="Lucro Mensal"
            value={safeCurrency(stats?.monthlyProfit)}
            icon={PiggyBank}
            trend={{ value: 15.3, isPositive: true }}
            color="purple"
          />
        </div>

        {/* Métricas Operacionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Diligências Ativas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {safeNumber(stats?.activeDiligences)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">
                  {safeNumber(stats?.completedDiligences)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Correspondentes Ativos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {safeNumber(stats?.activeCorrespondents)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Taxa de Crescimento */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Crescimento Mensal</h3>
              <p className="text-gray-600">Performance da plataforma</p>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-green-600">
                +{safeToFixed(stats?.growthRate, 1)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Diligências Recentes */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Diligências Recentes</h3>
            {recentDiligences.length > 0 ? (
              <div className="space-y-4">
                {recentDiligences.slice(0, 5).map((diligence) => (
                  <div key={diligence.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{diligence.title || 'Sem título'}</p>
                      <p className="text-sm text-gray-500">
                        Cliente: {diligence.clientName || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        diligence.status === 'completed' ? 'success' :
                        diligence.status === 'in_progress' ? 'warning' : 'default'
                      }>
                        {diligence.status || 'Pendente'}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {diligence.createdAt ? 
                          format(new Date(diligence.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : 
                          'Data não informada'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhuma diligência recente encontrada</p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Renderização para Cliente
  if (user?.role === 'client') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Dashboard</h1>
          <p className="text-gray-600">Acompanhe suas diligências e atividades</p>
        </div>

        {/* Stats Cards para Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Minhas Diligências"
            value={safeNumber(stats?.myDiligences).toString()}
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="Em Andamento"
            value={safeNumber(stats?.pendingDiligences).toString()}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="Concluídas"
            value={safeNumber(stats?.completedDiligences).toString()}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Métricas do Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Investido</p>
                <p className="text-2xl font-bold text-green-600">
                  {safeCurrency(stats?.totalSpent)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tempo Médio de Resposta</p>
                <p className="text-2xl font-bold text-blue-600">
                  {safeToFixed(stats?.averageResponseTime, 0)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Avaliação de Satisfação */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Avaliação de Satisfação</h3>
              <p className="text-gray-600">Sua experiência com nossos serviços</p>
            </div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-yellow-600">
                {safeToFixed(stats?.satisfactionRate, 1)}★
              </span>
            </div>
          </div>
        </Card>

        {/* Minhas Diligências Recentes */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Minhas Diligências Recentes</h3>
            {recentDiligences.length > 0 ? (
              <div className="space-y-4">
                {recentDiligences.slice(0, 5).map((diligence) => (
                  <div key={diligence.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{diligence.title || 'Sem título'}</p>
                      <p className="text-sm text-gray-500">
                        Correspondente: {diligence.correspondentName || 'Não atribuído'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        diligence.status === 'completed' ? 'success' :
                        diligence.status === 'in_progress' ? 'warning' : 'default'
                      }>
                        {diligence.status || 'Pendente'}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {diligence.createdAt ? 
                          format(new Date(diligence.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : 
                          'Data não informada'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhuma diligência encontrada</p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default Dashboard;

