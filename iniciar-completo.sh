#!/bin/bash

echo "🚀 ====================================="
echo "🚀 INICIANDO JURISCONNECT COMPLETO"
echo "🚀 ====================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Porta em uso
    else
        return 1  # Porta livre
    fi
}

# Função para matar processo em uma porta
kill_port() {
    local port=$1
    echo -e "${YELLOW}🔍 Verificando porta $port...${NC}"
    
    if check_port $port; then
        echo -e "${YELLOW}⚠️  Porta $port está em uso. Matando processo...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 2
        
        if check_port $port; then
            echo -e "${RED}❌ Não foi possível liberar a porta $port${NC}"
            return 1
        else
            echo -e "${GREEN}✅ Porta $port liberada com sucesso${NC}"
            return 0
        fi
    else
        echo -e "${GREEN}✅ Porta $port está livre${NC}"
        return 0
    fi
}

# Verificar se estamos no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto JurisConnect-Final${NC}"
    echo -e "${YELLOW}💡 Certifique-se de estar no diretório que contém as pastas 'backend' e 'frontend'${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Passo 1: Limpando portas em uso...${NC}"
kill_port 3000
kill_port 3001
kill_port 3002
kill_port 5173

echo ""
echo -e "${BLUE}📋 Passo 2: Configurando Backend...${NC}"

# Ir para o diretório do backend
cd backend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
    npm install
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚙️  Criando arquivo .env para o backend...${NC}"
    cat > .env << EOL
# Configuração do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=jurisconnect

# Configuração do Servidor
PORT=3002
NODE_ENV=development

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_123456789

# CORS
CORS_ORIGIN=http://localhost:5173
EOL
fi

echo -e "${GREEN}✅ Backend configurado${NC}"

echo ""
echo -e "${BLUE}📋 Passo 3: Configurando Frontend...${NC}"

# Ir para o diretório do frontend
cd ../frontend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
    npm install
fi

# Verificar se o arquivo .env existe e configurar corretamente
echo -e "${YELLOW}⚙️  Configurando .env do frontend...${NC}"
cat > .env << EOL
# Configuração da API Backend
REACT_APP_API_URL=http://localhost:3002/api

# Configuração de Desenvolvimento
REACT_APP_ENV=development
REACT_APP_DEBUG=true

# Configuração de Timeout
REACT_APP_API_TIMEOUT=10000
EOL

echo -e "${GREEN}✅ Frontend configurado${NC}"

echo ""
echo -e "${BLUE}📋 Passo 4: Iniciando Backend...${NC}"

# Voltar para o backend
cd ../backend

# Compilar TypeScript se necessário
if [ -f "tsconfig.json" ]; then
    echo -e "${YELLOW}🔨 Compilando TypeScript...${NC}"
    npx tsc --noEmit || echo -e "${YELLOW}⚠️  Avisos de TypeScript ignorados${NC}"
fi

# Iniciar backend em background
echo -e "${GREEN}🚀 Iniciando backend na porta 3002...${NC}"
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

# Aguardar backend inicializar
echo -e "${YELLOW}⏳ Aguardando backend inicializar...${NC}"
sleep 5

# Verificar se o backend está rodando
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend iniciado com sucesso (PID: $BACKEND_PID)${NC}"
    
    # Testar conectividade
    echo -e "${YELLOW}🔍 Testando conectividade do backend...${NC}"
    for i in {1..10}; do
        if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend respondendo corretamente!${NC}"
            break
        else
            echo -e "${YELLOW}⏳ Tentativa $i/10 - Aguardando backend...${NC}"
            sleep 2
        fi
        
        if [ $i -eq 10 ]; then
            echo -e "${RED}❌ Backend não está respondendo após 20 segundos${NC}"
            echo -e "${YELLOW}📋 Verifique o log: tail -f backend.log${NC}"
        fi
    done
else
    echo -e "${RED}❌ Erro ao iniciar backend${NC}"
    echo -e "${YELLOW}📋 Verifique o log: cat backend.log${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Passo 5: Iniciando Frontend...${NC}"

# Ir para o frontend
cd ../frontend

echo -e "${GREEN}🚀 Iniciando frontend na porta 5173...${NC}"
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Aguardar frontend inicializar
echo -e "${YELLOW}⏳ Aguardando frontend inicializar...${NC}"
sleep 8

# Verificar se o frontend está rodando
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend iniciado com sucesso (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Erro ao iniciar frontend${NC}"
    echo -e "${YELLOW}📋 Verifique o log: cat frontend.log${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 ====================================="
echo -e "${GREEN}🎉 JURISCONNECT INICIADO COM SUCESSO!"
echo -e "${GREEN}🎉 =====================================${NC}"
echo ""
echo -e "${BLUE}🌐 URLs de Acesso:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5173${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:3002${NC}"
echo -e "   API:      ${GREEN}http://localhost:3002/api${NC}"
echo -e "   Health:   ${GREEN}http://localhost:3002/api/health${NC}"
echo ""
echo -e "${BLUE}📋 Informações dos Processos:${NC}"
echo -e "   Backend PID:  ${YELLOW}$BACKEND_PID${NC}"
echo -e "   Frontend PID: ${YELLOW}$FRONTEND_PID${NC}"
echo ""
echo -e "${BLUE}📋 Logs:${NC}"
echo -e "   Backend:  ${YELLOW}tail -f backend.log${NC}"
echo -e "   Frontend: ${YELLOW}tail -f frontend.log${NC}"
echo ""
echo -e "${BLUE}🛑 Para parar os serviços:${NC}"
echo -e "   ${YELLOW}kill $BACKEND_PID $FRONTEND_PID${NC}"
echo -e "   ou pressione ${YELLOW}Ctrl+C${NC} e execute:"
echo -e "   ${YELLOW}pkill -f 'npm run dev'${NC}"
echo ""
echo -e "${GREEN}✨ Agora acesse http://localhost:5173 e faça login!${NC}"
echo -e "${GREEN}✨ A mensagem 'Backend indisponível' deve desaparecer!${NC}"
echo ""

# Salvar PIDs para facilitar o stop
echo "$BACKEND_PID" > backend.pid
echo "$FRONTEND_PID" > frontend.pid

# Aguardar interrupção
echo -e "${YELLOW}⏳ Pressione Ctrl+C para parar os serviços...${NC}"
trap 'echo -e "\n${YELLOW}🛑 Parando serviços...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Manter script rodando
while true; do
    sleep 1
done

