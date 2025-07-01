#!/bin/bash

# Script para iniciar o backend JurisConnect na porta 3000 (padrão)

echo "🚀 Iniciando JurisConnect Backend na porta 3000..."

# Verificar se Node.js está disponível
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Configurando ambiente..."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    if ! command -v node &> /dev/null; then
        echo "❌ Erro: Node.js não está instalado ou configurado."
        echo "💡 Execute: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
        echo "💡 Depois: nvm install 18 && nvm use 18"
        exit 1
    fi
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
echo "✅ Node.js detectado: $NODE_VERSION"

# Navegar para o diretório do backend
cd backend

# Verificar se o projeto foi compilado
if [ ! -d "dist" ]; then
    echo "📦 Compilando projeto..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Erro na compilação. Verifique os erros acima."
        exit 1
    fi
fi

echo "🔧 Configurando porta 3000..."
export PORT=3000

echo "🎯 Iniciando servidor em modo demo..."
echo "📍 URL: http://localhost:3000"
echo "📊 API: http://localhost:3000/api"
echo "🔑 Login: admin@jurisconnect.com / admin123"
echo ""
echo "⚠️  Para parar o servidor, pressione Ctrl+C"
echo ""

# Iniciar o servidor
node dist/index-demo.js

