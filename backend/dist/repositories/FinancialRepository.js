"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialRepository = void 0;
const data_source_1 = require("../data-source");
const Payment_1 = require("../entities/Payment");
const PaymentProof_1 = require("../entities/PaymentProof");
const errorHandler_1 = require("../middlewares/errorHandler");
class FinancialRepository {
    constructor() {
        this.paymentRepository = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
        this.paymentProofRepository = data_source_1.AppDataSource.getRepository(PaymentProof_1.PaymentProof);
    }
    async createPayment(paymentData) {
        const payment = this.paymentRepository.create(paymentData);
        return this.paymentRepository.save(payment);
    }
    async updatePayment(id, paymentData) {
        const payment = await this.paymentRepository.findOneBy({ id });
        if (!payment) {
            throw new errorHandler_1.AppError("Pagamento não encontrado", 404);
        }
        this.paymentRepository.merge(payment, paymentData);
        return this.paymentRepository.save(payment);
    }
    async findPaymentById(id) {
        return this.paymentRepository.findOne({
            where: { id },
            relations: ["diligence", "client", "correspondent"],
        });
    }
    async findAllPayments() {
        return this.paymentRepository.find({
            relations: ["diligence", "client", "correspondent"],
            order: { createdAt: "DESC" }
        });
    }
    async findPaymentsByDiligence(diligenceId) {
        return this.paymentRepository.find({
            where: { diligenceId },
            relations: ["diligence", "client", "correspondent"],
        });
    }
    async findPaymentsByClient(clientId) {
        return this.paymentRepository.find({
            where: { clientId },
            relations: ["diligence"],
        });
    }
    async findPaymentsByCorrespondent(correspondentId) {
        return this.paymentRepository.find({
            where: { correspondentId },
            relations: ["diligence"],
        });
    }
    async createPaymentProof(proofData) {
        const proof = this.paymentProofRepository.create(proofData);
        return this.paymentProofRepository.save(proof);
    }
    async updatePaymentProof(id, proofData) {
        const proof = await this.paymentProofRepository.findOneBy({ id });
        if (!proof) {
            throw new errorHandler_1.AppError("Comprovante não encontrado", 404);
        }
        this.paymentProofRepository.merge(proof, proofData);
        return this.paymentProofRepository.save(proof);
    }
    async findPaymentProofById(id) {
        return this.paymentProofRepository.findOne({
            where: { id },
            relations: ["diligence", "uploadedBy", "verifiedBy"],
        });
    }
    async findPaymentProofByDiligence(diligenceId) {
        return this.paymentProofRepository.findOne({
            where: { diligenceId },
            relations: ["diligence", "uploadedBy", "verifiedBy"],
        });
    }
    async findPendingPaymentProofs() {
        return this.paymentProofRepository.find({
            where: { status: "pending_verification" },
            relations: ["diligence", "uploadedBy"],
        });
    }
}
exports.FinancialRepository = FinancialRepository;
//# sourceMappingURL=FinancialRepository.js.map