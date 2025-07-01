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
exports.Diligence = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Attachment_1 = require("./Attachment");
const Payment_1 = require("./Payment");
const PaymentProof_1 = require("./PaymentProof");
const StatusHistory_1 = require("./StatusHistory");
let Diligence = class Diligence {
};
exports.Diligence = Diligence;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Diligence.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Diligence.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], Diligence.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Diligence.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["pending", "assigned", "in_progress", "completed", "cancelled", "disputed"],
        default: "pending",
    }),
    __metadata("design:type", String)
], Diligence.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["low", "medium", "high", "urgent"],
        default: "medium",
    }),
    __metadata("design:type", String)
], Diligence.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Diligence.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp" }),
    __metadata("design:type", Date)
], Diligence.prototype, "deadline", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Diligence.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Diligence.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.clientDiligences),
    (0, typeorm_1.JoinColumn)({ name: "clientId" }),
    __metadata("design:type", User_1.User)
], Diligence.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Diligence.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.correspondentDiligences, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "correspondentId" }),
    __metadata("design:type", User_1.User)
], Diligence.prototype, "correspondent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Diligence.prototype, "correspondentId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Attachment_1.Attachment, (attachment) => attachment.diligence),
    __metadata("design:type", Array)
], Diligence.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Payment_1.Payment, (payment) => payment.diligence),
    __metadata("design:type", Array)
], Diligence.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => PaymentProof_1.PaymentProof, (paymentProof) => paymentProof.diligence, { nullable: true }),
    __metadata("design:type", PaymentProof_1.PaymentProof)
], Diligence.prototype, "paymentProof", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StatusHistory_1.StatusHistory, (statusHistory) => statusHistory.diligence),
    __metadata("design:type", Array)
], Diligence.prototype, "statusHistory", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Diligence.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Diligence.prototype, "updatedAt", void 0);
exports.Diligence = Diligence = __decorate([
    (0, typeorm_1.Entity)("diligences")
], Diligence);
//# sourceMappingURL=Diligence.js.map