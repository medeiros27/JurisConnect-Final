import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [connectedUrl, setConnectedUrl] = useState<string>('');

  // Configuração da API - ORDEM CORRETA DAS PORTAS
  const getApiUrl = () => {
    // Tentar pegar da variável de ambiente primeiro
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    if (import.meta.env.REACT_APP_API_URL) {
      return import.meta.env.REACT_APP_API_URL;
    }
    // Fallback para desenvolvimento - PORTA 3002 PRIMEIRO
    return 'http://localhost:3002/api';
  };

  // URLs em ordem de prioridade - 3002 PRIMEIRO
  const API_URLS = [
    'http://localhost:3002/api', // Backend principal
    getApiUrl(),
    'http://localhost:3000/api', // Fallback
    'http://localhost:3001/api'  // Fallback
  ];

  const checkBackendHealth = async (showDebug: boolean = false) => {
    setBackendStatus('checking');
    let lastError = '';
    
    for (const baseUrl of API_URLS) {
      // Rotas de health check em ordem de prioridade
      const healthUrls = [
        `${baseUrl}/health`,        // Rota principal
        `${baseUrl}/auth/health`,   // Rota de auth
        `${baseUrl}/status`,        // Rota de status
        `${baseUrl}/ping`           // Rota de ping
      ];

      for (const url of healthUrls) {
        try {
          if (showDebug) {
            console.log(`🔍 Testando: ${url}`);
            setDebugInfo(`Testando: ${url}`);
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout reduzido para 3s

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            signal: controller.signal,
            cache: 'no-cache'
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.text();
            console.log(`✅ Backend conectado em: ${url}`, data);
            setBackendStatus('online');
            setLastCheck(new Date());
            setRetryCount(0);
            setConnectedUrl(url);
            setDebugInfo(`✅ Conectado: ${url}`);
            return;
          } else {
            lastError = `HTTP ${response.status}: ${response.statusText}`;
            if (showDebug) {
              console.log(`❌ ${url} - ${lastError}`);
            }
          }
        } catch (error: any) {
          if (error.name === 'AbortError') {
            lastError = 'Timeout (3s)';
          } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
            lastError = 'Conexão recusada - Backend offline';
          } else if (error.message.includes('ERR_NETWORK')) {
            lastError = 'Erro de rede';
          } else {
            lastError = error.message;
          }
          
          if (showDebug) {
            console.log(`❌ ${url} - ${lastError}`);
          }
        }
      }
    }

    // Se chegou aqui, nenhuma URL funcionou
    console.error('❌ Backend indisponível em todas as URLs testadas');
    console.error('Último erro:', lastError);
    setBackendStatus('offline');
    setLastCheck(new Date());
    setConnectedUrl('');
    setDebugInfo(`❌ Falhou: ${lastError}`);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    checkBackendHealth(true);
  };

  // Verificar status da conexão com a internet
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verificação inicial e periódica do backend
  useEffect(() => {
    checkBackendHealth();

    // Verificar a cada 30 segundos
    const interval = setInterval(() => {
      checkBackendHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Se não há conexão com a internet
  if (!isOnline) {
    return (
      <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between ${className}`}>
        <div className="flex items-center">
          <WifiOff className="h-5 w-5 mr-2" />
          <span className="font-medium">Sem conexão com a internet</span>
        </div>
      </div>
    );
  }

  // Se o backend está online
  if (backendStatus === 'online') {
    return (
      <div className={`bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between ${className}`}>
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Backend conectado</span>
          <span className="text-sm ml-2">
            (Última verificação: {lastCheck.toLocaleTimeString()})
          </span>
          {connectedUrl && (
            <span className="text-xs ml-2 opacity-75">
              • {connectedUrl}
            </span>
          )}
        </div>
        <Wifi className="h-5 w-5" />
      </div>
    );
  }

  // Se está verificando
  if (backendStatus === 'checking') {
    return (
      <div className={`bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg flex items-center justify-between ${className}`}>
        <div className="flex items-center">
          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          <span className="font-medium">Verificando conexão com o backend...</span>
          {debugInfo && (
            <span className="text-sm ml-2">({debugInfo})</span>
          )}
        </div>
      </div>
    );
  }

  // Se o backend está offline
  return (
    <div className={`bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <div>
            <span className="font-medium">Backend indisponível - Funcionando em modo offline</span>
            <div className="text-sm mt-1">
              Última verificação: {lastCheck.toLocaleTimeString()}
              {retryCount > 0 && ` (Tentativa ${retryCount})`}
            </div>
            {debugInfo && (
              <div className="text-xs mt-1 opacity-75">
                Debug: {debugInfo}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleRetry}
          className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Tentar novamente
        </button>
      </div>
      
      {/* Informações de diagnóstico */}
      <div className="mt-3 text-xs bg-yellow-50 p-2 rounded border">
        <div className="font-medium mb-1">🔍 Diagnóstico:</div>
        <div>• API URL configurada: {getApiUrl()}</div>
        <div>• URLs testadas: {API_URLS.join(', ')}</div>
        <div>• Rotas testadas: /health, /auth/health, /status, /ping</div>
        <div>• Timeout: 3 segundos por tentativa</div>
        <div className="mt-1 font-medium text-red-600">
          ⚠️ Verifique se o backend está rodando na porta 3002
        </div>
        <div className="mt-1 text-gray-600">
          💡 Execute: <code className="bg-gray-200 px-1 rounded">cd backend && npm run dev</code>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;

