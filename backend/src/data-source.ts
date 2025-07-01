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
import { CreateInitialSchema1750980000000 } from "./migrations/1750980000000-CreateInitialSchema";

dotenv.config();

// Configuração para produção usando DATABASE_URL
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

let dataSourceConfig: any = {
    type: "postgres",
    synchronize: !isProduction, // Apenas em desenvolvimento
    logging: !isProduction,
    entities: [
        User, 
        Diligence, 
        Attachment, 
        Payment, 
        PaymentProof, 
        Notification, 
        StatusHistory
    ],
    migrations: [
        CreateInitialSchema1750980000000
    ],
    subscribers: [],
};

if (isProduction && databaseUrl) {
    // Configuração para produção com DATABASE_URL
    dataSourceConfig = {
        ...dataSourceConfig,
        url: databaseUrl,
        ssl: {
            rejectUnauthorized: false
        }
    };
} else {
    // Configuração para desenvolvimento
    dataSourceConfig = {
        ...dataSourceConfig,
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "001516",
        database: process.env.DB_DATABASE || "jurisconnect",
    };
}

export const AppDataSource = new DataSource(dataSourceConfig);

