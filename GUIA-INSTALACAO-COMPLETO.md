# 🚀 GUIA COMPLETO DE INSTALAÇÃO - JURISCONNECT

## 📋 **PRÉ-REQUISITOS**

Antes de começar, certifique-se de ter instalado:

### **1. Node.js (versão 18 ou superior)**
- **Download**: https://nodejs.org/
- **Verificar instalação**: `node --version`

### **2. PostgreSQL (versão 12 ou superior)**
- **Download**: https://www.postgresql.org/download/
- **Ou use pgAdmin4** para interface gráfica

### **3. Git (opcional)**
- **Download**: https://git-scm.com/

---

## 📁 **ESTRUTURA DO PROJETO**

```
JurisConnect-Final/
├── backend/          # API Node.js + TypeScript
├── frontend/         # Interface React + TypeScript
├── public/           # Arquivos públicos
├── README.md         # Documentação principal
├── API.md           # Documentação da API
└── GUIA-INSTALACAO-COMPLETO.md  # Este arquivo
```

---

## ⚡ **INSTALAÇÃO RÁPIDA (RECOMENDADA)**

### **PASSO 1: Extrair o projeto**
```bash
# Extrair o ZIP para uma pasta de sua escolha
# Exemplo: C:\Users\SeuUsuario\Desktop\JurisConnect-Final
```

### **PASSO 2: Configurar Backend**
```bash
# Abrir terminal na pasta backend
cd backend

# Instalar dependências
npm install

# Configurar banco de dados (ver seção PostgreSQL abaixo)

# Iniciar servidor
npm run dev
```

### **PASSO 3: Configurar Frontend**
```bash
# Abrir NOVO terminal na pasta frontend
cd frontend

# Instalar dependências
npm install

# Iniciar interface
npm run dev
```

### **PASSO 4: Acessar o sistema**
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

---

## 🗄️ **CONFIGURAÇÃO DO POSTGRESQL**

### **Opção A: Configuração Completa (Recomendada)**

1. **Instalar PostgreSQL**
   - Download: https://www.postgresql.org/download/
   - Durante instalação, definir senha para usuário `postgres`

2. **Criar banco de dados**
   ```sql
   -- Abrir pgAdmin4 ou psql
   CREATE DATABASE jurisconnect;
   ```

3. **Configurar arquivo .env**
   ```bash
   # Na pasta backend, editar arquivo .env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=SUA_SENHA_AQUI
   DB_DATABASE=jurisconnect
   ```

4. **Executar seed (criar usuários)**
   ```bash
   # Na pasta backend
   npm run seed:postgres
   ```

### **Opção B: Modo Demo (Sem PostgreSQL)**

Se não quiser instalar PostgreSQL, use o modo demo:

```bash
# Na pasta backend
node dist/index-demo.js
```

**Vantagens do modo demo:**
- ✅ Não precisa de PostgreSQL
- ✅ Dados de demonstração inclusos
- ✅ Funciona imediatamente
- ⚠️ Dados não são salvos permanentemente

---

## 👥 **CONTAS DE DEMONSTRAÇÃO**

### **Administrador**
- **Email**: admin@jurisconnect.com
- **Senha**: admin123
- **Acesso**: Todas as funcionalidades

### **Cliente (Escritório)**
- **Email**: cliente@exemplo.com
- **Senha**: cliente123
- **Acesso**: Criar e acompanhar diligências

### **Correspondente Jurídico**
- **Email**: correspondente@exemplo.com
- **Senha**: corresp123
- **Acesso**: Executar diligências

---

## 🔧 **COMANDOS ÚTEIS**

### **Backend**
```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Compilar TypeScript
npm run build

# Executar versão compilada
npm start

# Executar seed (criar usuários)
npm run seed:postgres

# Modo demo (sem PostgreSQL)
node dist/index-demo.js
```

### **Frontend**
```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Visualizar build
npm run preview
```

---

## 🌐 **PORTAS UTILIZADAS**

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **PostgreSQL**: localhost:5432

---

## 🔍 **SOLUÇÃO DE PROBLEMAS**

### **Problema: "Backend indisponível"**
**Solução:**
1. Verificar se backend está rodando: http://localhost:3000
2. Se não estiver, executar: `npm run dev` na pasta backend
3. Aguardar mensagem: "🚀 Servidor rodando na porta 3000"

### **Problema: "Erro de conexão com banco"**
**Soluções:**
1. **Verificar PostgreSQL**: Confirmar se está rodando
2. **Verificar credenciais**: Arquivo .env com senha correta
3. **Usar modo demo**: `node dist/index-demo.js`

### **Problema: "Porta já em uso"**
**Solução:**
```bash
# Windows - Finalizar processo na porta 3000
netstat -ano | findstr :3000
taskkill /PID [NUMERO_DO_PID] /F

# Reiniciar backend
npm run dev
```

### **Problema: "Dependências não instaladas"**
**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 **FUNCIONALIDADES DISPONÍVEIS**

### **✅ Implementadas e Testadas:**
- 🔐 **Sistema de Login** (JWT + bcrypt)
- 👥 **Gestão de Usuários** (Admin, Cliente, Correspondente)
- 📋 **Dashboard** com métricas em tempo real
- 💰 **Módulo Financeiro** com relatórios
- 📨 **Sistema de Notificações**
- 📱 **Interface Responsiva** (desktop + mobile)
- 🔄 **Status de Conexão** em tempo real

### **🎯 Dados de Demonstração:**
- 156 diligências cadastradas
- R$ 45.600 em receita total
- 12 correspondentes ativos
- Transações financeiras realistas

---

## 🚀 **DEPLOY EM PRODUÇÃO**

### **Frontend (Netlify/Vercel)**
```bash
# Na pasta frontend
npm run build
# Upload da pasta 'dist' para serviço de hospedagem
```

### **Backend (Heroku/Railway)**
```bash
# Configurar variáveis de ambiente
DATABASE_URL=postgresql://user:pass@host:port/db
PORT=3000
NODE_ENV=production
```

---

## 📞 **SUPORTE**

### **Logs do Sistema:**
- **Backend**: Console do terminal onde rodou `npm run dev`
- **Frontend**: Console do navegador (F12)

### **Arquivos de Log:**
- **Testes**: `relatorio-completo-testes.md`
- **Backend**: `relatorio-testes-backend.md`

### **URLs de Teste:**
- **API Status**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/auth/health
- **Frontend**: http://localhost:5173

---

## 🎉 **PRONTO PARA USAR!**

Após seguir este guia, você terá:
- ✅ Sistema completo funcionando
- ✅ Banco de dados configurado
- ✅ Usuários de demonstração criados
- ✅ Interface web acessível
- ✅ APIs funcionando perfeitamente

**Acesse http://localhost:5173 e faça login com qualquer conta de demonstração!**

---

*Desenvolvido com ❤️ para gestão de correspondentes jurídicos*

