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
exports.StatusHistory = void 0;
const typeorm_1 = require("typeorm");
const Diligence_1 = require("./Diligence");
const User_1 = require("./User");
let StatusHistory = class StatusHistory {
};
exports.StatusHistory = StatusHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], StatusHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Diligence_1.Diligence, (diligence) => diligence.statusHistory, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "diligenceId" }),
    __metadata("design:type", Diligence_1.Diligence)
], StatusHistory.prototype, "diligence", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StatusHistory.prototype, "diligenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StatusHistory.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["diligence", "payment"],
    }),
    __metadata("design:type", String)
], StatusHistory.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StatusHistory.prototype, "paymentType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StatusHistory.prototype, "previousStatus", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StatusHistory.prototype, "newStatus", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", User_1.User)
], StatusHistory.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StatusHistory.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    __metadata("design:type", String)
], StatusHistory.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StatusHistory.prototype, "timestamp", void 0);
exports.StatusHistory = StatusHistory = __decorate([
    (0, typeorm_1.Entity)("status_history")
], StatusHistory);
//# sourceMappingURL=StatusHistory.js.map