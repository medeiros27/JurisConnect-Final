#!/bin/bash

echo "🚀 Iniciando JurisConnect Backend na porta 3002..."
echo "📍 Diretório atual: $(pwd)"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado!"
    echo "💡 Certifique-se de estar no diretório backend/"
    exit 1
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Definir a porta como 3002
export PORT=3002

echo "🔧 Configurações:"
echo "   - Porta: $PORT"
echo "   - Ambiente: development"
echo "   - Modo: demo (sem PostgreSQL obrigatório)"

echo ""
echo "🔄 Compilando TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro na compilação!"
    exit 1
fi

echo ""
echo "✅ Compilação bem-sucedida!"
echo "🚀 Iniciando servidor..."
echo ""
echo "📋 Usuários de teste:"
echo "   👤 Admin: admin@jurisconnect.com / admin123"
echo "   👤 Cliente: cliente@exemplo.com / cliente123"
echo "   👤 Correspondente: correspondente@exemplo.com / corresp123"
echo ""
echo "🌐 Servidor rodando em: http://localhost:3002"
echo "🔗 API disponível em: http://localhost:3002/api"
echo ""
echo "⏹️  Para parar o servidor, pressione Ctrl+C"
echo ""

# Iniciar o servidor
node dist/index-demo.js

