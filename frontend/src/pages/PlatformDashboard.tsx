import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import platformService from '../services/platformService'; // Importação correta
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlatformAnalytics {
  totalUsers: number;
  totalDiligences: number;
  completedDiligences: number;
  pendingDiligences: number;
  totalRevenue: number;
  averageRating: number;
  responseTime: number;
  conversionRate: number;
  userGrowth: number;
  revenueGrowth: number;
  satisfactionScore: number;
  activeUsers: number;
}

const PlatformDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

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

  // Função auxiliar para formatar moeda
  const formatCurrency = (value: number | undefined | null): string => {
    const safeValue = safeNumber(value, 0);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(safeValue);
  };

  // Função auxiliar para formatar porcentagem
  const formatPercentage = (value: number | undefined | null): string => {
    return `${safeToFixed(value, 1)}%`;
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Carregando analytics da plataforma...');
      
      // Usar o service diretamente (não getInstance)
      const data = await platformService.getPlatformAnalytics();
      
      console.log('✅ Analytics carregados:', data);
      setAnalytics(data);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('❌ Erro ao carregar analytics:', error);
      setError('Erro ao carregar dados da plataforma');
      
      // Fallback para dados mockados em caso de erro
      const fallbackData: PlatformAnalytics = {
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
      
      setAnalytics(fallbackData);
      console.log('📊 Usando dados de fallback');
      
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalytics();
  };

  useEffect(() => {
    loadAnalytics();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Carregando analytics da plataforma..." />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-gray-600 mb-4">Não foi possível carregar os analytics da plataforma.</p>
          <Button onClick={handleRefresh}>Tentar Novamente</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics da Plataforma</h1>
          <p className="text-gray-600">
            Visão geral completa do desempenho • Última atualização: {format(lastUpdate, 'HH:mm:ss', { locale: ptBR })}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh}>
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatório Completo
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeNumber(analytics.totalUsers).toLocaleString()}
              </p>
              <p className="text-sm text-green-600">
                +{formatPercentage(analytics.userGrowth)} este mês
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Diligências</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeNumber(analytics.totalDiligences).toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">
                {safeNumber(analytics.completedDiligences)} concluídas
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.totalRevenue)}
              </p>
              <p className="text-sm text-green-600">
                +{formatPercentage(analytics.revenueGrowth)} este mês
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avaliação Média</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeToFixed(analytics.averageRating, 1)}★
              </p>
              <p className="text-sm text-gray-600">
                de {safeNumber(analytics.totalDiligences)} avaliações
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Métricas Operacionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Operacional</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-gray-700">Tempo de Resposta Médio</span>
              </div>
              <span className="font-semibold text-blue-600">
                {safeToFixed(analytics.responseTime, 1)}h
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-gray-700">Taxa de Conversão</span>
              </div>
              <span className="font-semibold text-green-600">
                {formatPercentage(analytics.conversionRate)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-gray-700">Diligências Concluídas</span>
              </div>
              <span className="font-semibold text-purple-600">
                {safeNumber(analytics.completedDiligences)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-gray-700">Usuários Ativos</span>
              </div>
              <span className="font-semibold text-orange-600">
                {safeNumber(analytics.activeUsers)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Qualidade</h3>
          <div className="space-y-6">
            {/* Satisfação do Cliente */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Satisfação do Cliente</span>
                <span className="text-sm text-gray-500">
                  {safeToFixed(analytics.satisfactionScore, 1)}/5.0
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(safeNumber(analytics.satisfactionScore, 0) / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Taxa de Conclusão */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Taxa de Conclusão</span>
                <span className="text-sm text-gray-500">
                  {formatPercentage((analytics.completedDiligences / analytics.totalDiligences) * 100)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(analytics.completedDiligences / analytics.totalDiligences) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Crescimento de Usuários */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Crescimento de Usuários</span>
                <span className="text-sm text-gray-500">
                  +{formatPercentage(analytics.userGrowth)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, safeNumber(analytics.userGrowth, 0) * 5)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Status das Diligências */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Diligências</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {safeNumber(analytics.completedDiligences)}
            </p>
            <p className="text-sm text-gray-600">Concluídas</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {safeNumber(analytics.pendingDiligences)}
            </p>
            <p className="text-sm text-gray-600">Pendentes</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {safeNumber(analytics.totalDiligences)}
            </p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Resumo Financeiro</h3>
          <Badge variant="success">
            +{formatPercentage(analytics.revenueGrowth)} crescimento
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Receita Total</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(analytics.totalRevenue)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(analytics.totalRevenue / analytics.totalDiligences)}
            </p>
          </div>
        </div>
      </Card>

      {/* Informações de Debug */}
      {error && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              {error} - Exibindo dados de demonstração
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PlatformDashboard;

