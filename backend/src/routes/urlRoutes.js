import express from 'express';
import { createUrl, getUserUrls, deleteUrl, editUrl, bulkCreateUrls, getPublicUrls, getPublicStats } from '../controllers/urlController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();

// Public routes (no auth)
router.get('/public', getPublicUrls);
router.get('/public/stats/:shortCode', getPublicStats);

// Protected routes
router.post('/', protect, createUrl);
router.post('/bulk', protect, bulkCreateUrls);
router.get('/user', protect, getUserUrls);
router.put('/:id', protect, editUrl);
router.delete('/:id', protect, deleteUrl);

export default router;