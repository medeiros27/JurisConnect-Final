import axios, { AxiosInstance, AxiosResponse } from 'axios';

// A sua lógica para obter a URL base está ótima.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

// Interceptador para lidar com respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // --- CORREÇÃO ESSENCIAL ---
    // Retornamos apenas a propriedade 'data' da resposta.
    // Isto garante que os seus serviços e hooks recebem
    // diretamente o array ou objeto JSON que o backend enviou,
    // o que resolve o erro ".filter is not a function".
    return response.data;
  },
  (error) => {
    // A sua lógica de tratamento de erros foi mantida.
    console.error(`❌ Erro na resposta da API:`, error.message);

    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        console.warn('🔄 Token inválido, limpando dados de autenticação e redirecionando para login.');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
