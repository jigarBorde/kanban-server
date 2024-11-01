import express from 'express';
import { getProfile, userGoogleLogin, logout } from '../controllers/auth/userAuthController';
import { authenticateJWT } from '../middlewares/auth';

const router = express.Router();


// router.get('/google-register', userGoogleRegister);
router.post('/google-login', userGoogleLogin);
router.get('/profile', authenticateJWT, getProfile);
router.post('/logout', authenticateJWT, logout);

export default router;
