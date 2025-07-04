import "reflect-metadata";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Diligence } from "./entities/Diligence";
import { Attachment } from "./entities/Attachment";
import { Payment } from "./entities/Payment";
import { PaymentProof } from "./entities/PaymentProof";
import { Notification } from "./entities/Notification";
import { StatusHistory } from "./entities/StatusHistory";

dotenv.config();

// Configuração para produção usando DATABASE_URL
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

let dataSourceConfig: any = {
    synchronize: true, // Sempre true para simplificar
    logging: false, // Reduzir logs
    entities: [
        User, 
        Diligence, 
        Attachment, 
        Payment, 
        PaymentProof, 
        Notification, 
        StatusHistory
    ],
    migrations: [],
    subscribers: [],
    // Configurações de conexão mais robustas
    connectTimeoutMS: 5000,
    acquireTimeoutMillis: 5000,
    timeout: 5000,
    maxQueryExecutionTime: 5000
};

if (isProduction && databaseUrl) {
    // Configuração para produção com DATABASE_URL
    dataSourceConfig = {
        ...dataSourceConfig,
        type: "postgres",
        url: databaseUrl,
        ssl: {
            rejectUnauthorized: false
        }
    };
} else {
    // Tentar PostgreSQL primeiro, depois SQLite como fallback
    const usePostgres = process.env.DB_TYPE !== 'sqlite';
    
    if (usePostgres) {
        dataSourceConfig = {
            ...dataSourceConfig,
            type: "postgres",
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT || "5432"),
            username: process.env.DB_USERNAME || "postgres", 
            password: process.env.DB_PASSWORD || "001516",
            database: process.env.DB_DATABASE || "jurisconnect",
        };
    } else {
        // Fallback para SQLite se PostgreSQL não funcionar
        dataSourceConfig = {
            ...dataSourceConfig,
            type: "sqlite",
            database: "./database.sqlite"
        };
    }
}

export const AppDataSource = new DataSource(dataSourceConfig);

// Função para verificar e alternar para SQLite se PostgreSQL falhar
export async function initializeDatabase() {
    try {
        console.log('🔍 Tentando conectar ao PostgreSQL...');
        await AppDataSource.initialize();
        console.log('✅ PostgreSQL conectado com sucesso!');
        return true;
    } catch (error) {
        // ✅ CORREÇÃO: Tratamento correto do tipo 'unknown'
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn('⚠️ PostgreSQL falhou, tentando SQLite...', errorMessage);
        
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
        
        // Reconfigurar para SQLite
        const sqliteConfig = {
            ...dataSourceConfig,
            type: "sqlite" as const,
            database: "./database.sqlite",
            host: undefined,
            port: undefined,
            username: undefined,
            password: undefined
        };
        
        const sqliteDataSource = new DataSource(sqliteConfig);
        
        try {
            await sqliteDataSource.initialize();
            console.log('✅ SQLite conectado como fallback!');
            
            // Substituir a instância global
            (global as any).AppDataSource = sqliteDataSource;
            return true;
        } catch (sqliteError) {
            // ✅ CORREÇÃO: Tratamento correto do tipo 'unknown'
            const sqliteErrorMessage = sqliteError instanceof Error ? sqliteError.message : String(sqliteError);
            console.error('❌ Erro ao conectar SQLite:', sqliteErrorMessage);
            return false;
        }
    }
}