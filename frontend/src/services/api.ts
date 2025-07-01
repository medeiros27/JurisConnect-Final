import axios from 'axios';

// Configuração da URL base da API usando variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL, 
  timeout: 10000,
});

// Interceptador para adicionar o token JWT a todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'mock_token_' + Date.now()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador para tratamento de erros
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("Erro na chamada da API:", error.message);
    
    // Se for erro de rede (backend não disponível), não redirecionar
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.warn('Backend não disponível - modo offline');
      return Promise.reject(error);
    }
    
    // Se o erro for 401 (não autorizado) e não for um token mock, remover token e redirecionar
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token && !token.startsWith('mock_token_')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Só redirecionar se não estivermos já na página de login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

