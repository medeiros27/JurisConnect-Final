import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';
import financialService from '../services/financialService';
import platformService from '../services/platformService';

interface ReportData {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalDiligences: number;
  completedDiligences: number;
  averageTicket: number;
  growthRate: number;
  topCorrespondents: Array<{
    id: string;
    name: string;
    completedDiligences: number;
    revenue: number;
    rating: number;
  }>;
  topClients: Array<{
    id: string;
    name: string;
    totalSpent: number;
    diligencesCount: number;
  }>;
  performanceMetrics: {
    averageResponseTime: number;
    completionRate: number;
    clientSatisfaction: number;
    correspondentUtilization: number;
  };
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reportType, setReportType] = useState<'financial' | 'operational' | 'performance'>('financial');

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

  // Função auxiliar para formatar porcentagem com segurança
  const safePercentage = (value: number | undefined | null): string => {
    return `${safeToFixed(value, 1)}%`;
  };

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, selectedDate, reportType]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      // Calcular período baseado na seleção
      let startDate: Date;
      let endDate: Date;

      switch (selectedPeriod) {
        case 'month':
          startDate = startOfMonth(selectedDate);
          endDate = endOfMonth(selectedDate);
          break;
        case 'quarter':
          const quarterStart = new Date(selectedDate.getFullYear(), Math.floor(selectedDate.getMonth() / 3) * 3, 1);
          startDate = quarterStart;
          endDate = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
          break;
        case 'year':
          startDate = new Date(selectedDate.getFullYear(), 0, 1);
          endDate = new Date(selectedDate.getFullYear(), 11, 31);
          break;
        default:
          startDate = startOfMonth(selectedDate);
          endDate = endOfMonth(selectedDate);
      }

      // Carregar dados baseado no tipo de relatório
      const [financialData, operationalData, performanceData] = await Promise.all([
        financialService.getFinancialReport(startDate, endDate),
        platformService.getOperationalReport(startDate, endDate),
        platformService.getPerformanceReport(startDate, endDate)
      ]);

      // Combinar dados com validação de segurança
      const combinedData: ReportData = {
        period: format(startDate, 'MMMM yyyy', { locale: ptBR }),
        totalRevenue: safeNumber(financialData?.totalRevenue),
        totalExpenses: safeNumber(financialData?.totalExpenses),
        netProfit: safeNumber(financialData?.netProfit),
        totalDiligences: safeNumber(operationalData?.totalDiligences),
        completedDiligences: safeNumber(operationalData?.completedDiligences),
        averageTicket: safeNumber(financialData?.averageTicket),
        growthRate: safeNumber(financialData?.growthRate),
        topCorrespondents: Array.isArray(operationalData?.topCorrespondents) 
          ? operationalData.topCorrespondents.map((c: any) => ({
              id: c.id || '',
              name: c.name || 'Nome não informado',
              completedDiligences: safeNumber(c.completedDiligences),
              revenue: safeNumber(c.revenue),
              rating: safeNumber(c.rating, 0)
            }))
          : [],
        topClients: Array.isArray(operationalData?.topClients)
          ? operationalData.topClients.map((c: any) => ({
              id: c.id || '',
              name: c.name || 'Nome não informado',
              totalSpent: safeNumber(c.totalSpent),
              diligencesCount: safeNumber(c.diligencesCount)
            }))
          : [],
        performanceMetrics: {
          averageResponseTime: safeNumber(performanceData?.averageResponseTime),
          completionRate: safeNumber(performanceData?.completionRate),
          clientSatisfaction: safeNumber(performanceData?.clientSatisfaction),
          correspondentUtilization: safeNumber(performanceData?.correspondentUtilization)
        }
      };

      setReportData(combinedData);

    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      
      // Fallback para dados mockados
      const mockData: ReportData = {
        period: format(selectedDate, 'MMMM yyyy', { locale: ptBR }),
        totalRevenue: 45000,
        totalExpenses: 28000,
        netProfit: 17000,
        totalDiligences: 156,
        completedDiligences: 142,
        averageTicket: 288.46,
        growthRate: 15.3,
        topCorrespondents: [
          {
            id: '1',
            name: 'Maria Santos',
            completedDiligences: 23,
            revenue: 6900,
            rating: 4.8
          },
          {
            id: '2',
            name: 'João Silva',
            completedDiligences: 19,
            revenue: 5700,
            rating: 4.6
          }
        ],
        topClients: [
          {
            id: '1',
            name: 'Empresa ABC Ltda',
            totalSpent: 8500,
            diligencesCount: 12
          },
          {
            id: '2',
            name: 'Consultoria XYZ',
            totalSpent: 6200,
            diligencesCount: 8
          }
        ],
        performanceMetrics: {
          averageResponseTime: 18.5,
          completionRate: 91.0,
          clientSatisfaction: 4.7,
          correspondentUtilization: 78.5
        }
      };

      setReportData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    // Implementar exportação
    console.log(`Exportando relatório em formato ${format}`);
    // Aqui você implementaria a lógica de exportação
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    let newDate: Date;
    
    switch (selectedPeriod) {
      case 'month':
        newDate = direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1);
        break;
      case 'quarter':
        newDate = direction === 'prev' ? subMonths(selectedDate, 3) : addMonths(selectedDate, 3);
        break;
      case 'year':
        newDate = new Date(selectedDate.getFullYear() + (direction === 'prev' ? -1 : 1), selectedDate.getMonth(), selectedDate.getDate());
        break;
      default:
        newDate = selectedDate;
    }
    
    setSelectedDate(newDate);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Gerando relatório..." />
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar relatório</h3>
          <p className="text-gray-600 mb-4">Não foi possível carregar os dados do relatório.</p>
          <Button onClick={loadReportData}>Tentar Novamente</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise detalhada de performance e resultados</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Controles */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Tipo de Relatório */}
          <div className="flex space-x-2">
            {[
              { id: 'financial', label: 'Financeiro', icon: DollarSign },
              { id: 'operational', label: 'Operacional', icon: BarChart3 },
              { id: 'performance', label: 'Performance', icon: Target }
            ].map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant={reportType === type.id ? 'default' : 'outline'}
                  onClick={() => setReportType(type.id as any)}
                  className="flex items-center"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {type.label}
                </Button>
              );
            })}
          </div>

          {/* Período */}
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {[
                { id: 'month', label: 'Mês' },
                { id: 'quarter', label: 'Trimestre' },
                { id: 'year', label: 'Ano' }
              ].map((period) => (
                <Button
                  key={period.id}
                  variant={selectedPeriod === period.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.id as any)}
                >
                  {period.label}
                </Button>
              ))}
            </div>

            {/* Navegação de Data */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigatePeriod('prev')}>
                ←
              </Button>
              <span className="text-sm font-medium min-w-32 text-center">
                {reportData.period}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigatePeriod('next')}>
                →
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeCurrency(reportData.totalRevenue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Lucro Líquido</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeCurrency(reportData.netProfit)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Diligências</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeNumber(reportData.totalDiligences)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-600 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeCurrency(reportData.averageTicket)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Relatório Financeiro */}
      {reportType === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise Financeira</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Receita Total</span>
                <span className="font-semibold text-green-600">
                  {safeCurrency(reportData.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Despesas Totais</span>
                <span className="font-semibold text-red-600">
                  {safeCurrency(reportData.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-gray-900 font-medium">Lucro Líquido</span>
                <span className="font-bold text-blue-600">
                  {safeCurrency(reportData.netProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Margem de Lucro</span>
                <span className="font-semibold">
                  {safePercentage((reportData.netProfit / reportData.totalRevenue) * 100)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Crescimento</span>
                <span className="font-semibold text-green-600">
                  +{safePercentage(reportData.growthRate)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clientes</h3>
            <div className="space-y-3">
              {reportData.topClients.map((client, index) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-500">
                      {safeNumber(client.diligencesCount)} diligências
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{safeCurrency(client.totalSpent)}</p>
                    <Badge variant="default">#{index + 1}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Relatório Operacional */}
      {reportType === 'operational' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Operacionais</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Diligências</span>
                <span className="font-semibold">{safeNumber(reportData.totalDiligences)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Concluídas</span>
                <span className="font-semibold text-green-600">
                  {safeNumber(reportData.completedDiligences)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taxa de Conclusão</span>
                <span className="font-semibold">
                  {safePercentage((reportData.completedDiligences / reportData.totalDiligences) * 100)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ticket Médio</span>
                <span className="font-semibold">{safeCurrency(reportData.averageTicket)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Correspondentes</h3>
            <div className="space-y-3">
              {reportData.topCorrespondents.map((correspondent, index) => (
                <div key={correspondent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{correspondent.name}</p>
                    <p className="text-sm text-gray-500">
                      {safeNumber(correspondent.completedDiligences)} concluídas
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{safeCurrency(correspondent.revenue)}</p>
                    <div className="flex items-center">
                      <Award className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-sm">{safeToFixed(correspondent.rating, 1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Relatório de Performance */}
      {reportType === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Performance</h3>
            <div className="space-y-6">
              {/* Tempo de Resposta */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Tempo Médio de Resposta</span>
                  <span className="text-sm text-gray-500">
                    {safeToFixed(reportData.performanceMetrics.averageResponseTime, 1)}h
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, Math.max(10, 100 - (reportData.performanceMetrics.averageResponseTime * 2)))}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Taxa de Conclusão */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Taxa de Conclusão</span>
                  <span className="text-sm text-gray-500">
                    {safePercentage(reportData.performanceMetrics.completionRate)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${safeNumber(reportData.performanceMetrics.completionRate, 0)}%` }}
                  ></div>
                </div>
              </div>

              {/* Satisfação do Cliente */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Satisfação do Cliente</span>
                  <span className="text-sm text-gray-500">
                    {safeToFixed(reportData.performanceMetrics.clientSatisfaction, 1)}/5.0
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(reportData.performanceMetrics.clientSatisfaction / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Utilização de Correspondentes */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Utilização de Correspondentes</span>
                  <span className="text-sm text-gray-500">
                    {safePercentage(reportData.performanceMetrics.correspondentUtilization)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${safeNumber(reportData.performanceMetrics.correspondentUtilization, 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Performance</h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-xl font-bold text-blue-600">
                  {safeToFixed(reportData.performanceMetrics.averageResponseTime, 1)}h
                </p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                <p className="text-xl font-bold text-green-600">
                  {safePercentage(reportData.performanceMetrics.completionRate)}
                </p>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Satisfação</p>
                <p className="text-xl font-bold text-yellow-600">
                  {safeToFixed(reportData.performanceMetrics.clientSatisfaction, 1)}/5.0
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;

