"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformController = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const Diligence_1 = require("../entities/Diligence");
const Payment_1 = require("../entities/Payment");
class PlatformController {
    async getAnalytics(req, res) {
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const diligenceRepository = (0, typeorm_1.getRepository)(Diligence_1.Diligence);
        const paymentRepository = (0, typeorm_1.getRepository)(Payment_1.Payment);
        // Cálculos podem ser otimizados com queries mais complexas
        const totalDiligences = await diligenceRepository.count();
        const completedDiligences = await diligenceRepository.count({ where: { status: 'completed' } });
        const activeCorrespondents = await userRepository.count({
            where: { role: 'correspondent', status: 'active' }
        });
        const activeClients = await userRepository.count({
            where: { role: 'client', status: 'active' }
        });
        const totalRevenueResult = await paymentRepository
            .createQueryBuilder("payment")
            .select("SUM(payment.amount)", "total")
            .where("payment.status = :status", { status: 'completed' })
            .getRawOne();
        const totalRevenue = totalRevenueResult.total || 0;
        const analytics = {
            totalDiligences,
            activeCorrespondents,
            activeClients,
            totalRevenue: parseFloat(totalRevenue),
            completionRate: totalDiligences > 0 ? (completedDiligences / totalDiligences) * 100 : 0,
        };
        return res.status(200).json(analytics);
    }
}
exports.PlatformController = PlatformController;
//# sourceMappingURL=PlatformController.js.map