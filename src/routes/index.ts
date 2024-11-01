import express from 'express';
const router = express.Router();

import authRoutes from './authRoutes';


// Define your routes
router.use('/auth', authRoutes);

export default router;