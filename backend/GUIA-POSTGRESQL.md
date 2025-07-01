# 🚀 GUIA COMPLETO: PostgreSQL + JurisConnect

## ✅ CONFIGURAÇÃO CONCLUÍDA

Todos os arquivos foram configurados para funcionar com seu PostgreSQL:

### 📋 CREDENCIAIS CONFIGURADAS:
- **Host**: localhost
- **Porta**: 5432
- **Usuário**: postgres
- **Senha**: 001516
- **Banco**: jurisconnect

## 🎯 PRÓXIMOS PASSOS NO SEU PC:

### 1️⃣ **Baixar e Extrair Arquivos**
- Baixe o arquivo .zip que será enviado
- Extraia na sua pasta do projeto

### 2️⃣ **Instalar Dependências**
```bash
cd backend
npm install
```

### 3️⃣ **Executar Script de Seed**
```bash
# Opção 1: Script otimizado para PostgreSQL
npx ts-node src/scripts/seed-postgres.ts

# Opção 2: Se der erro, use este comando
npm run seed:postgres
```

### 4️⃣ **Iniciar Backend**
```bash
npm run dev
```

### 5️⃣ **Verificar no pgAdmin4**
Após executar o seed, você verá no pgAdmin4:
- Tabela `users` com 4 usuários criados
- Outras tabelas do sistema criadas automaticamente

## 🔑 USUÁRIOS CRIADOS:

| Tipo | Email | Senha |
|------|-------|-------|
| **Admin** | admin@jurisconnect.com | admin123 |
| **Cliente** | cliente@exemplo.com | cliente123 |
| **Correspondente** | correspondente@exemplo.com | corresp123 |
| **Correspondente** | carlos@correspondente.com | corresp456 |

## 🛠️ COMANDOS ÚTEIS:

### Verificar Conexão:
```bash
# Testar se conecta ao banco
npx ts-node -e "
import { AppDataSource } from './src/data-source';
AppDataSource.initialize()
  .then(() => console.log('✅ Conexão OK'))
  .catch(err => console.error('❌ Erro:', err))
  .finally(() => process.exit());
"
```

### Recriar Tabelas (se necessário):
```bash
# Apagar todas as tabelas e recriar
npx typeorm schema:drop -d src/data-source.ts
npx typeorm schema:sync -d src/data-source.ts
```

## 🔧 RESOLUÇÃO DE PROBLEMAS:

### ❌ "ECONNREFUSED"
- Verifique se PostgreSQL está rodando
- Confirme se a porta 5432 está livre
- Teste conexão no pgAdmin4

### ❌ "database does not exist"
- Crie o banco "jurisconnect" no pgAdmin4
- Ou execute: `CREATE DATABASE jurisconnect;`

### ❌ "password authentication failed"
- Confirme se a senha é "001516"
- Verifique usuário "postgres"

## ✅ SUCESSO!
Quando tudo funcionar, você verá:
```
✅ Conexão com PostgreSQL estabelecida!
📍 Conectado ao banco: jurisconnect
📊 Usuários existentes no banco: 0
📝 Criando usuários iniciais...
👤 Criando usuário Admin...
✅ Admin criado: admin@jurisconnect.com / admin123
...
🎉 SEED EXECUTADO COM SUCESSO!
```

