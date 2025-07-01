import "reflect-metadata";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Diligence } from "./entities/Diligence";
import { Attachment } from "./entities/Attachment";
import { Payment } from "./entities/Payment-sqlite";
import { PaymentProof } from "./entities/PaymentProof";
import { Notification } from "./entities/Notification";
import { StatusHistory } from "./entities/StatusHistory";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
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
});

