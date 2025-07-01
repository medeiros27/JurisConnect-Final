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
const dotenv = __importStar(require("dotenv"));
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const bcrypt = __importStar(require("bcryptjs"));
dotenv.config();
// Configuração simples apenas para User
const AppDataSourceSimple = new typeorm_1.DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: true,
    entities: [User_1.User], // Apenas User por enquanto
});
async function seedUsers() {
    try {
        // Inicializar conexão
        await AppDataSourceSimple.initialize();
        console.log('✅ Conexão SQLite estabelecida');
        // Repositório de usuários
        const userRepository = AppDataSourceSimple.getRepository(User_1.User);
        // Verificar se já existem usuários
        const userCount = await userRepository.count();
        if (userCount > 0) {
            console.log('✅ Usuários já existem no banco. Total:', userCount);
            await AppDataSourceSimple.destroy();
            return;
        }
        console.log('📝 Criando usuários...');
        // Admin
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = userRepository.create({
            name: 'Administrador',
            email: 'admin@jurisconnect.com',
            password: adminPassword,
            role: 'admin',
            status: 'active',
        });
        await userRepository.save(admin);
        console.log('✅ Admin criado: admin@jurisconnect.com / admin123');
        // Cliente
        const clientPassword = await bcrypt.hash('cliente123', 10);
        const client = userRepository.create({
            name: 'João Silva',
            email: 'cliente@exemplo.com',
            password: clientPassword,
            role: 'client',
            status: 'active',
            phone: '(11) 99999-9999',
        });
        await userRepository.save(client);
        console.log('✅ Cliente criado: cliente@exemplo.com / cliente123');
        // Correspondente
        const correspondentPassword = await bcrypt.hash('corresp123', 10);
        const correspondent = userRepository.create({
            name: 'Maria Santos',
            email: 'correspondente@exemplo.com',
            password: correspondentPassword,
            role: 'correspondent',
            status: 'active',
            phone: '(11) 88888-8888',
            oab: 'SP123456',
            city: 'São Paulo',
            state: 'SP',
        });
        await userRepository.save(correspondent);
        console.log('✅ Correspondente criado: correspondente@exemplo.com / corresp123');
        console.log('🎉 Usuários criados com sucesso!');
        await AppDataSourceSimple.destroy();
    }
    catch (error) {
        console.error('❌ Erro ao criar usuários:', error);
        if (AppDataSourceSimple.isInitialized) {
            await AppDataSourceSimple.destroy();
        }
        process.exit(1);
    }
}
seedUsers();
//# sourceMappingURL=seed-users.js.map