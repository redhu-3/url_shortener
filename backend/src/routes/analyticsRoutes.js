import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();

router.get('/:urlId', protect, getAnalytics);

export default router;