import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import api from '../../services/api';

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true);

  useEffect(() => {
    // Verificar conexão com a internet
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar conexão com o backend
    const checkBackendConnection = async () => {
      try {
        await api.get('/health');
        setIsBackendAvailable(true);
      } catch (error) {
        setIsBackendAvailable(false);
      }
    };

    // Verificar a cada 30 segundos
    const interval = setInterval(checkBackendConnection, 30000);
    checkBackendConnection(); // Verificar imediatamente

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && isBackendAvailable) {
    return null; // Não mostrar nada quando tudo está funcionando
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm">
      <div className="flex items-center justify-center space-x-2">
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Sem conexão com a internet</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Backend indisponível - Funcionando em modo offline</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;

