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
exports.AppDataSource = void 0;
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const Diligence_1 = require("./entities/Diligence");
const Attachment_1 = require("./entities/Attachment");
const Payment_1 = require("./entities/Payment");
const PaymentProof_1 = require("./entities/PaymentProof");
const Notification_1 = require("./entities/Notification");
const StatusHistory_1 = require("./entities/StatusHistory");
const _1750980000000_CreateInitialSchema_1 = require("./migrations/1750980000000-CreateInitialSchema");
dotenv.config();
// Configuração para produção usando DATABASE_URL
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;
let dataSourceConfig = {
    type: "postgres",
    synchronize: !isProduction, // Apenas em desenvolvimento
    logging: !isProduction,
    entities: [
        User_1.User,
        Diligence_1.Diligence,
        Attachment_1.Attachment,
        Payment_1.Payment,
        PaymentProof_1.PaymentProof,
        Notification_1.Notification,
        StatusHistory_1.StatusHistory
    ],
    migrations: [
        _1750980000000_CreateInitialSchema_1.CreateInitialSchema1750980000000
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
}
else {
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
exports.AppDataSource = new typeorm_1.DataSource(dataSourceConfig);
//# sourceMappingURL=data-source.js.map