"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProof = void 0;
const typeorm_1 = require("typeorm");
const Diligence_1 = require("./Diligence");
const User_1 = require("./User");
let PaymentProof = class PaymentProof {
};
exports.PaymentProof = PaymentProof;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], PaymentProof.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Diligence_1.Diligence, (diligence) => diligence.paymentProof),
    (0, typeorm_1.JoinColumn)({ name: "diligenceId" }),
    __metadata("design:type", Diligence_1.Diligence)
], PaymentProof.prototype, "diligence", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentProof.prototype, "diligenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["client_payment", "correspondent_payment"],
    }),
    __metadata("design:type", String)
], PaymentProof.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PaymentProof.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentProof.prototype, "pixKey", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentProof.prototype, "proofImage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["pending_verification", "verified", "rejected"],
        default: "pending_verification",
    }),
    __metadata("design:type", String)
], PaymentProof.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "uploadedById" }),
    __metadata("design:type", User_1.User)
], PaymentProof.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentProof.prototype, "uploadedById", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PaymentProof.prototype, "uploadedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "verifiedById" }),
    __metadata("design:type", User_1.User)
], PaymentProof.prototype, "verifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentProof.prototype, "verifiedById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], PaymentProof.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentProof.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentProof.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PaymentProof.prototype, "updatedAt", void 0);
exports.PaymentProof = PaymentProof = __decorate([
    (0, typeorm_1.Entity)("payment_proofs")
], PaymentProof);
//# sourceMappingURL=PaymentProof.js.map