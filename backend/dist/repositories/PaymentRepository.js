"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const data_source_1 = require("../data-source");
const Payment_1 = require("../entities/Payment");
const typeorm_1 = require("typeorm");
class PaymentRepository extends typeorm_1.Repository {
    constructor() {
        super(Payment_1.Payment, data_source_1.AppDataSource.manager);
    }
    async createPayment(paymentData) {
        const payment = this.create(paymentData);
        return this.save(payment);
    }
    async findById(id) {
        return this.findOne({
            where: { id },
            relations: ["diligence", "paymentProof"],
        });
    }
    async findAll() {
        return this.find({
            relations: ["diligence", "paymentProof"],
        });
    }
    async updatePayment(id, paymentData) {
        const payment = await this.findById(id);
        if (!payment) {
            return null;
        }
        this.merge(payment, paymentData);
        return this.save(payment);
    }
    async deletePayment(id) {
        return this.delete(id);
    }
    async findByDiligence(diligenceId) {
        return this.find({
            where: { diligence: { id: diligenceId } },
            relations: ["diligence", "paymentProof"],
        });
    }
    async findByClient(clientId) {
        return this.find({
            where: { diligence: { client: { id: clientId } } },
            relations: ["diligence", "paymentProof"],
        });
    }
    async findByCorrespondent(correspondentId) {
        return this.find({
            where: { diligence: { correspondent: { id: correspondentId } } },
            relations: ["diligence", "paymentProof"],
        });
    }
    async findByStatus(status) {
        return this.find({
            where: { status }, // CORREÇÃO: O tipo do status agora é explícito
            relations: ["diligence", "paymentProof"],
        });
    }
}
exports.PaymentRepository = PaymentRepository;
//# sourceMappingURL=PaymentRepository.js.map