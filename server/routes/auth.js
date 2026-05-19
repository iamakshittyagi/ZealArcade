import express from 'express';
import { register, login, getMe, updateCoins } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/coins', protect, updateCoins);
export default router;