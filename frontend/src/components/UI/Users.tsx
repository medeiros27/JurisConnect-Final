import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';
import { usePagination } from '../../hooks/usePagination';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import Pagination from './Pagination';
import ConfirmModal from '../Modals/ConfirmModal';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  UserX,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '../UI/ToastContainer';
import userService from '../../services/userService';

// Função helper para formatar datas com segurança
const formatSafeDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Data não disponível';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    return 'Data inválida';
  }
};

// Função helper para validar strings
const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

// Função helper para validar valores opcionais
const safeOptionalString = (value: any): string | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  return String(value);
};

// Interface para tipagem do usuário
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'correspondent';
  status: 'active' | 'pending' | 'inactive';
  phone?: string;
  city?: string;
  state?: string;
  oab?: string;
  createdAt?: string;
}

// Interface para ação de confirmação
interface ConfirmAction {
  type: 'delete' | 'approve' | 'reject';
  user: User;
  title: string;
  message: string;
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { users, loading, error, refreshUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filtrar usuários com validação de dados
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      // Validação básica dos dados do usuário
      if (!user || !user.id) return false;
      
      const userName = safeString(user.name);
      const userEmail = safeString(user.email);
      const userRole = safeString(user.role);
      const userStatus = safeString(user.status);
      
      const matchesSearch = searchTerm === '' || 
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || userRole === roleFilter;
      const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Paginação
  const {
    currentPage,
    totalPages,
    currentData: paginatedUsers,
    goToPage,
    itemsPerPage: currentItemsPerPage,
    setItemsPerPage: updateItemsPerPage,
    totalItems
  } = usePagination({
    data: filteredUsers,
    itemsPerPage,
    persistKey: 'users_list'
  });

  // Atualizar itemsPerPage quando o estado local mudar
  useEffect(() => {
    updateItemsPerPage(itemsPerPage);
  }, [itemsPerPage, updateItemsPerPage]);

  // Função para obter badge do role com validação
  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { variant: 'danger' | 'info' | 'success' | 'default'; label: string }> = {
      admin: { variant: 'danger', label: 'Administrador' },
      client: { variant: 'info', label: 'Cliente' },
      correspondent: { variant: 'success', label: 'Correspondente' }
    };
    
    return roleMap[role] || { variant: 'default', label: safeString(role) || 'Desconhecido' };
  };

  // Função para obter badge do status com validação
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }> = {
      active: { variant: 'success', label: 'Ativo' },
      pending: { variant: 'warning', label: 'Pendente' },
      inactive: { variant: 'danger', label: 'Inativo' }
    };
    
    return statusMap[status] || { variant: 'default', label: safeString(status) || 'Desconhecido' };
  };

  // Função para deletar usuário com tratamento de erros
  const handleDeleteUser = async (): Promise<void> => {
    if (!confirmAction || confirmAction.type !== 'delete') return;

    setIsLoading(true);
    try {
      await userService.deleteUser(confirmAction.user.id);
      addToast({
        type: 'success',
        title: 'Usuário excluído!',
        message: 'O usuário foi excluído com sucesso.'
      });
      refreshUsers();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addToast({
        type: 'error',
        title: 'Erro ao excluir',
        message: errorMessage || 'Não foi possível excluir o usuário. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para aprovar correspondente com tratamento de erros
  const handleApproveCorrespondent = async (): Promise<void> => {
    if (!confirmAction || confirmAction.type !== 'approve') return;

    setIsLoading(true);
    try {
      await userService.approveCorrespondent(confirmAction.user.id);
      addToast({
        type: 'success',
        title: 'Correspondente aprovado!',
        message: 'O correspondente foi aprovado com sucesso.'
      });
      refreshUsers();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addToast({
        type: 'error',
        title: 'Erro ao aprovar',
        message: errorMessage || 'Não foi possível aprovar o correspondente. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para rejeitar correspondente com tratamento de erros
  const handleRejectCorrespondent = async (): Promise<void> => {
    if (!confirmAction || confirmAction.type !== 'reject') return;

    setIsLoading(true);
    try {
      await userService.rejectCorrespondent(confirmAction.user.id);
      addToast({
        type: 'success',
        title: 'Correspondente rejeitado',
        message: 'O correspondente foi rejeitado com sucesso.'
      });
      refreshUsers();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addToast({
        type: 'error',
        title: 'Erro ao rejeitar',
        message: errorMessage || 'Não foi possível rejeitar o correspondente. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função principal para confirmar ações
  const handleConfirmAction = async (): Promise<void> => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case 'delete':
          await handleDeleteUser();
          break;
        case 'approve':
          await handleApproveCorrespondent();
          break;
        case 'reject':
          await handleRejectCorrespondent();
          break;
        default:
          console.warn('Tipo de ação não reconhecido:', confirmAction.type);
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
    }
  };

  // Função para abrir modal de confirmação
  const openConfirmModal = (type: 'delete' | 'approve' | 'reject', user: User): void => {
    const userName = safeString(user.name) || 'Usuário sem nome';
    
    const actions: Record<string, { title: string; message: string }> = {
      delete: {
        title: 'Excluir Usuário',
        message: `Tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`
      },
      approve: {
        title: 'Aprovar Correspondente',
        message: `Tem certeza que deseja aprovar o correspondente "${userName}"? Ele poderá receber diligências após a aprovação.`
      },
      reject: {
        title: 'Rejeitar Correspondente',
        message: `Tem certeza que deseja rejeitar o correspondente "${userName}"? O cadastro será removido do sistema.`
      }
    };

    const action = actions[type];
    if (!action) {
      console.error('Tipo de ação inválido:', type);
      return;
    }

    setConfirmAction({
      type,
      user,
      ...action
    });
    setShowConfirmModal(true);
  };

  // Função para limpar filtros
  const clearFilters = (): void => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  // Função para navegar com segurança
  const safeNavigate = (path: string): void => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Erro ao navegar:', error);
      addToast({
        type: 'error',
        title: 'Erro de navegação',
        message: 'Não foi possível navegar para a página solicitada.'
      });
    }
  };

  // Estados de loading
  if (loading) {
    return (
      <div className="p-6">
        <LoadingState text="Carregando usuários..." />
      </div>
    );
  }

  // Estados de erro
  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Erro ao carregar usuários" 
          message={safeString(error)} 
          onRetry={refreshUsers} 
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie todos os usuários do sistema</p>
        </div>
        <Button onClick={() => safeNavigate('/users/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
                {(roleFilter !== 'all' || statusFilter !== 'all') && (
                  <Badge variant="primary" className="ml-2">
                    {(roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5 por página</option>
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
              </select>
            </div>
          </div>
          
          {/* Filtros avançados */}
          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Filtros Avançados</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar Filtros
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos os Perfis</option>
                    <option value="admin">Administrador</option>
                    <option value="client">Cliente</option>
                    <option value="correspondent">Correspondente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="active">Ativo</option>
                    <option value="pending">Pendente</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                {filteredUsers.length} usuário(s) encontrado(s)
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de Usuários */}
      {paginatedUsers.length === 0 ? (
        <EmptyState
          icon={Search}
          title={users.length === 0 ? "Nenhum usuário encontrado" : "Nenhum resultado para os filtros aplicados"}
          description={
            users.length === 0 
              ? "Ainda não há usuários cadastrados." 
              : "Tente ajustar os filtros de busca para encontrar o que procura."
          }
          action={
            users.length === 0 
              ? {
                  label: "Criar Primeiro Usuário",
                  onClick: () => safeNavigate('/users/new')
                }
              : {
                  label: "Limpar Filtros",
                  onClick: clearFilters,
                  variant: "outline"
                }
          }
        />
      ) : (
        <>
          <div className="grid gap-6 mb-6">
            {paginatedUsers.map((user) => {
              // Validação dos dados do usuário
              if (!user || !user.id) {
                console.warn('Usuário inválido encontrado:', user);
                return null;
              }

              const userName = safeString(user.name) || 'Nome não disponível';
              const userEmail = safeString(user.email) || 'Email não disponível';
              const userRole = safeString(user.role) || 'client';
              const userStatus = safeString(user.status) || 'inactive';
              
              const role = getRoleBadge(userRole);
              const status = getStatusBadge(userStatus);
              
              return (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
                          <Badge variant={role.variant}>{role.label}</Badge>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <span>{userEmail}</span>
                          </div>
                          
                          {safeOptionalString(user.phone) && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          
                          {safeOptionalString(user.city) && safeOptionalString(user.state) && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{user.city}, {user.state}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Cadastro: {formatSafeDate(user.createdAt)}</span>
                          </div>
                          
                          {safeOptionalString(user.oab) && (
                            <div className="flex items-center">
                              <UserCheck className="h-4 w-4 mr-2" />
                              <span>OAB: {user.oab}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => safeNavigate(`/users/${user.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => safeNavigate(`/users/${user.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      {userStatus === 'pending' && userRole === 'correspondent' && (
                        <>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => openConfirmModal('approve', user)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => openConfirmModal('reject', user)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => openConfirmModal('delete', user)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={totalItems}
              itemsPerPage={currentItemsPerPage}
              className="mt-6"
            />
          )}
        </>
      )}

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        type={confirmAction?.type === 'approve' ? 'success' : 'danger'}
        isLoading={isLoading}
        confirmText={
          confirmAction?.type === 'approve' ? 'Aprovar' :
          confirmAction?.type === 'reject' ? 'Rejeitar' : 'Excluir'
        }
      />
    </div>
  );
};

export default Users;