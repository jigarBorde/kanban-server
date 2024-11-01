import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import envConfig from '../config/envConfig';

const JWT_SECRET = envConfig.get('jwtSecret') as string;

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        googleId: string;
    };
}

export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.cookies['Authtoken'];

    console.log(authHeader);

    if (!authHeader) {
        res.status(401).json({ success: false, message: 'Access token is missing or invalid' });
        return; // Ensure `void` return
    }


    try {
        const decodedToken = jwt.verify(authHeader, JWT_SECRET) as { userId: string; googleId: string };
        req.user = decodedToken;  // Attach decoded token payload to the request for later use
        next();
    } catch (error) {
        res.status(403).json({ success: false, message: 'Invalid or expired access token' });
    }
};
