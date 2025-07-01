import { Router } from 'express';
import { PlatformController } from '../controllers/PlatformController';
import { authMiddleware, checkRole } from '../middlewares/authMiddleware';

const router = Router();
const platformController = new PlatformController();

// Apenas administradores podem aceder às análises da plataforma
router.get(
  '/analytics', 
  authMiddleware, 
  checkRole(['admin']), 
  platformController.getAnalytics
);

export default router;

