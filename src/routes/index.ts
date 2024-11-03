import express from 'express';
const router = express.Router();

import authRoutes from './authRoutes';
import taskRoutes from './taskRoutes';


// Define your routes
router.use('/auth', authRoutes);
router.use('/task', taskRoutes);

export default router;