import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Aumentado para 15 segundos
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptador para adicionar o token JWT a todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador para padronizar respostas e tratar erros globais
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // PADRONIZAÇÃO: Retorna sempre a propriedade 'data' da resposta.
    // Isto resolve os erros de ".filter is not a function" em toda a aplicação.
    return response.data;
  },
  (error) => {
    console.error(`❌ Erro na resposta da API:`, error.config?.url, error.message);

    // Tratamento global de erro de autenticação
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Evita loops de redirecionamento se já estiver na página de login
      if (currentPath !== '/login' && currentPath !== '/') {
        console.warn('🔄 Token inválido ou expirado. Limpando sessão e redirecionando para login.');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Força o redirecionamento para a página de login
        window.location.href = '/login';
      }
    }
    
    // Rejeita a promessa para que os blocos .catch() nos componentes possam lidar com o erro
    return Promise.reject(error);
  }
);

export default api;
