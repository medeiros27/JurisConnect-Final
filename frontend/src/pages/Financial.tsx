import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDiligences } from '../hooks/useDiligences';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Plus,
  Eye,
  CreditCard,
  Building,
  Receipt,
  FileText,
  Filter,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  PiggyBank,
  Target,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';
import financialService from '../services/financialService';
import { FinancialSummary, DiligenceFinancialData } from '../types';

const Financial: React.FC = () => {
  const { user } = useAuth();
  const { diligences } = useDiligences();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports'>('dashboard');
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [financialData, setFinancialData] = useState<DiligenceFinancialData[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const [correspondentData, setCorrespondentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para controle mensal
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState<{
    [key: string]: {
      summary: any;
      transactions: DiligenceFinancialData[];
    }
  }>({});

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
    loadFinancialData();
  }, [user, diligences, selectedMonth]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'admin') {
        // Admin vê tudo
        const [summary, allFinancialData] = await Promise.all([
          financialService.getFinancialSummary(),
          financialService.getAllFinancialData()
        ]);
        setFinancialSummary(summary || {});
        setFinancialData(allFinancialData || []);
        
        // Organizar dados por mês
        await organizeDataByMonth(allFinancialData || []);
      } else if (user?.role === 'client') {
        // Cliente vê apenas suas diligências
        const data = await financialService.getClientFinancialData(user.id, diligences);
        setClientData(data || {});
      } else if (user?.role === 'correspondent') {
        // Correspondente vê apenas suas diligências
        const data = await financialService.getCorrespondentFinancialData(user.id, diligences);
        setCorrespondentData(data || {});
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      
      // Fallback para dados mockados
      const mockSummary = {
        receitaTotal: 15000,
        despesaTotal: 8500,
        lucroLiquido: 6500,
        crescimentoMensal: 12.5,
        totalDiligencias: 45,
        ticketMedio: 333.33
      };
      
      setFinancialSummary(mockSummary);
      setFinancialData([]);
    } finally {
      setLoading(false);
    }
  };

  const organizeDataByMonth = async (allFinancialData: DiligenceFinancialData[]) => {
    try {
      const monthKey = format(selectedMonth, 'yyyy-MM');
      
      if (!monthlyData[monthKey]) {
        const monthStart = startOfMonth(selectedMonth);
        const monthEnd = endOfMonth(selectedMonth);
        
        // Filtrar transações do mês
        const monthTransactions = allFinancialData.filter(transaction => {
          const transactionDate = new Date(transaction.createdAt || '');
          return transactionDate >= monthStart && transactionDate <= monthEnd;
        });
        
        // Calcular resumo do mês
        const monthSummary = {
          receita: monthTransactions.reduce((sum, t) => sum + safeNumber(t.valor, 0), 0),
          transacoes: monthTransactions.length,
          ticketMedio: monthTransactions.length > 0 
            ? monthTransactions.reduce((sum, t) => sum + safeNumber(t.valor, 0), 0) / monthTransactions.length 
            : 0
        };
        
        setMonthlyData(prev => ({
          ...prev,
          [monthKey]: {
            summary: monthSummary,
            transactions: monthTransactions
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao organizar dados por mês:', error);
    }
  };

  const getCurrentMonthData = () => {
    const monthKey = format(selectedMonth, 'yyyy-MM');
    return monthlyData[monthKey] || { summary: {}, transactions: [] };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Carregando dados financeiros..." />
        </div>
      </div>
    );
  }

  // Renderização para Admin
  if (user?.role === 'admin') {
    const currentMonthData = getCurrentMonthData();
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-gray-600">Gestão financeira da plataforma</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'transactions', label: 'Transações', icon: Receipt },
              { id: 'reports', label: 'Relatórios', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Resumo Financeiro */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Receita Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {safeCurrency(financialSummary?.receitaTotal)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Despesas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {safeCurrency(financialSummary?.despesaTotal)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PiggyBank className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Lucro Líquido</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {safeCurrency(financialSummary?.lucroLiquido)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Crescimento</p>
                    <p className="text-2xl font-bold text-gray-900">
                      +{safeToFixed(financialSummary?.crescimentoMensal, 1)}%
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Controle Mensal */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Análise Mensal</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-lg font-medium">
                    {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Receita do Mês</p>
                  <p className="text-2xl font-bold text-green-600">
                    {safeCurrency(currentMonthData.summary.receita)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Transações</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {safeNumber(currentMonthData.summary.transacoes)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Ticket Médio</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {safeCurrency(currentMonthData.summary.ticketMedio)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Métricas Adicionais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total de Diligências</span>
                    <span className="font-semibold">{safeNumber(financialSummary?.totalDiligencias)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ticket Médio</span>
                    <span className="font-semibold">{safeCurrency(financialSummary?.ticketMedio)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taxa de Conversão</span>
                    <span className="font-semibold">85.2%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Pagamentos</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm">Pagamento João Silva</span>
                    </div>
                    <span className="text-sm font-medium text-yellow-600">R$ 450,00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm">Pagamento Maria Santos</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">R$ 320,00</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filtros */}
            <Card className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar transações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {currentMonthData.transactions.length} transações encontradas
                  </span>
                </div>
              </div>
            </Card>

            {/* Lista de Transações */}
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentMonthData.transactions
                      .filter(transaction => 
                        !searchTerm || 
                        transaction.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        transaction.diligenciaId?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((transaction, index) => (
                        <tr key={transaction.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.createdAt ? format(new Date(transaction.createdAt), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.descricao || 'Sem descrição'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {transaction.diligenciaId || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={transaction.tipo === 'receita' ? 'success' : 'warning'}>
                              {transaction.tipo || 'N/A'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span className={transaction.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                              {transaction.tipo === 'receita' ? '+' : '-'}{safeCurrency(transaction.valor)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={transaction.status === 'pago' ? 'success' : 'warning'}>
                              {transaction.status || 'Pendente'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios Financeiros</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Relatório Mensal</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span>Análise de Performance</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Target className="h-6 w-6 mb-2" />
                  <span>Projeções</span>
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Renderização para Cliente
  if (user?.role === 'client') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Pagamentos</h1>
          <p className="text-gray-600">Acompanhe seus pagamentos e faturas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Total Gasto</p>
                <p className="text-2xl font-bold">{safeCurrency(clientData?.totalGasto)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Diligências Pagas</p>
                <p className="text-2xl font-bold">{safeNumber(clientData?.diligenciasPagas)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-yellow-600 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Pendentes</p>
                <p className="text-2xl font-bold">{safeCurrency(clientData?.valorPendente)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Faturas do Cliente */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Minhas Faturas</h3>
            <div className="space-y-4">
              {(clientData?.faturas || []).map((fatura: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{fatura.descricao || 'Fatura'}</p>
                    <p className="text-sm text-gray-500">
                      {fatura.data ? format(new Date(fatura.data), 'dd/MM/yyyy', { locale: ptBR }) : 'Data não informada'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{safeCurrency(fatura.valor)}</p>
                    <Badge variant={fatura.status === 'pago' ? 'success' : 'warning'}>
                      {fatura.status || 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Renderização para Correspondente
  if (user?.role === 'correspondent') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Ganhos</h1>
          <p className="text-gray-600">Acompanhe seus ganhos e comissões</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Total Ganho</p>
                <p className="text-2xl font-bold">{safeCurrency(correspondentData?.totalGanho)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Diligências Concluídas</p>
                <p className="text-2xl font-bold">{safeNumber(correspondentData?.diligenciasConcluidas)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600 mr-4" />
              <div>
                <p className="text-sm text-gray-500">Comissão Média</p>
                <p className="text-2xl font-bold">{safeCurrency(correspondentData?.comissaoMedia)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Pagamentos do Correspondente */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Meus Pagamentos</h3>
            <div className="space-y-4">
              {(correspondentData?.pagamentos || []).map((pagamento: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{pagamento.descricao || 'Pagamento'}</p>
                    <p className="text-sm text-gray-500">
                      {pagamento.data ? format(new Date(pagamento.data), 'dd/MM/yyyy', { locale: ptBR }) : 'Data não informada'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+{safeCurrency(pagamento.valor)}</p>
                    <Badge variant={pagamento.status === 'pago' ? 'success' : 'warning'}>
                      {pagamento.status || 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default Financial;

