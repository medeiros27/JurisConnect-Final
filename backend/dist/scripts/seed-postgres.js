"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const bcrypt = __importStar(require("bcryptjs"));
async function seedDatabase() {
    try {
        console.log('🔄 Inicializando conexão com PostgreSQL...');
        // Inicializar conexão com o banco de dados
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
        }
        console.log('✅ Conexão com PostgreSQL estabelecida!');
        console.log(`📍 Conectado ao banco: ${data_source_1.AppDataSource.options.database}`);
        // Repositório de usuários
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        // Verificar se já existem usuários
        const userCount = await userRepository.count();
        console.log(`📊 Usuários existentes no banco: ${userCount}`);
        if (userCount > 0) {
            console.log('⚠️  Usuários já existem no banco de dados.');
            console.log('🔄 Deseja recriar os usuários? (Isso apagará os existentes)');
            // Para este exemplo, vamos pular se já existem usuários
            console.log('✅ Mantendo usuários existentes. Seed finalizado.');
            await data_source_1.AppDataSource.destroy();
            return;
        }
        console.log('📝 Criando usuários iniciais...');
        // 1. ADMINISTRADOR
        console.log('👤 Criando usuário Admin...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = userRepository.create({
            name: 'Administrador do Sistema',
            email: 'admin@jurisconnect.com',
            password: adminPassword,
            role: 'admin',
            status: 'active',
            phone: '(11) 99999-0000',
        });
        await userRepository.save(admin);
        console.log('✅ Admin criado: admin@jurisconnect.com / admin123');
        // 2. CLIENTE EXEMPLO
        console.log('👤 Criando usuário Cliente...');
        const clientPassword = await bcrypt.hash('cliente123', 10);
        const client = userRepository.create({
            name: 'João Silva Advocacia',
            email: 'cliente@exemplo.com',
            password: clientPassword,
            role: 'client',
            status: 'active',
            phone: '(11) 98765-4321',
            companyName: 'Silva & Associados Advocacia',
            cnpj: '12.345.678/0001-90',
            address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
            city: 'São Paulo',
            state: 'SP',
        });
        await userRepository.save(client);
        console.log('✅ Cliente criado: cliente@exemplo.com / cliente123');
        // 3. CORRESPONDENTE EXEMPLO
        console.log('👤 Criando usuário Correspondente...');
        const correspondentPassword = await bcrypt.hash('corresp123', 10);
        const correspondent = userRepository.create({
            name: 'Maria Santos',
            email: 'correspondente@exemplo.com',
            password: correspondentPassword,
            role: 'correspondent',
            status: 'active',
            phone: '(11) 87654-3210',
            oab: 'SP123456',
            city: 'São Paulo',
            state: 'SP',
            specialties: ['Direito Trabalhista', 'Direito Civil', 'Direito Empresarial'],
            coverage: ['São Paulo', 'Santos', 'Campinas'],
            rating: 4.8,
            totalDiligences: 25,
            completionRate: 96,
            responseTime: 4,
        });
        await userRepository.save(correspondent);
        console.log('✅ Correspondente criado: correspondente@exemplo.com / corresp123');
        // 4. CORRESPONDENTE ADICIONAL
        console.log('👤 Criando segundo correspondente...');
        const corresp2Password = await bcrypt.hash('corresp456', 10);
        const correspondent2 = userRepository.create({
            name: 'Carlos Oliveira',
            email: 'carlos@correspondente.com',
            password: corresp2Password,
            role: 'correspondent',
            status: 'active',
            phone: '(21) 99887-7665',
            oab: 'RJ789012',
            city: 'Rio de Janeiro',
            state: 'RJ',
            specialties: ['Direito Penal', 'Direito Tributário'],
            coverage: ['Rio de Janeiro', 'Niterói'],
            rating: 4.5,
            totalDiligences: 18,
            completionRate: 94,
            responseTime: 6,
        });
        await userRepository.save(correspondent2);
        console.log('✅ Segundo correspondente criado: carlos@correspondente.com / corresp456');
        console.log('\n🎉 SEED EXECUTADO COM SUCESSO!');
        console.log('\n📋 RESUMO DOS USUÁRIOS CRIADOS:');
        console.log('┌─────────────────────────────────────────────────────────┐');
        console.log('│ TIPO          │ EMAIL                    │ SENHA        │');
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log('│ Admin         │ admin@jurisconnect.com   │ admin123     │');
        console.log('│ Cliente       │ cliente@exemplo.com      │ cliente123   │');
        console.log('│ Correspondente│ correspondente@exemplo.com│ corresp123   │');
        console.log('│ Correspondente│ carlos@correspondente.com │ corresp456   │');
        console.log('└─────────────────────────────────────────────────────────┘');
        console.log('\n🚀 Agora você pode fazer login no sistema!');
        await data_source_1.AppDataSource.destroy();
        console.log('✅ Conexão com banco encerrada.');
    }
    catch (error) {
        console.error('❌ Erro ao executar seed:', error);
        if (error?.code === 'ECONNREFUSED') {
            console.error('\n🔥 ERRO DE CONEXÃO:');
            console.error('   - Verifique se o PostgreSQL está rodando');
            console.error('   - Confirme se as credenciais estão corretas');
            console.error('   - Verifique se o banco "jurisconnect" existe');
        }
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
        }
        process.exit(1);
    }
}
// Executar seed
seedDatabase();
//# sourceMappingURL=seed-postgres.js.map