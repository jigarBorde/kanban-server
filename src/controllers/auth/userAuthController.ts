import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import envConfig from '../../config/envConfig';
import { User } from '../../models/userModel';
import jwt from 'jsonwebtoken';
import ErrorHandler from '../../utils/errorHandler';




// User Register Controller
// export const userGoogleRegister = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         res.json({ message: 'Server is running' });
//     } catch (error) {
//         next(error);
//     }
// }

// User Login Controller
export const userGoogleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return next(new ErrorHandler(401, "No authentication token provided"));
        }

        const token = bearerToken.replace('Bearer ', '');

        const googleClientId = envConfig.get('googleClientId') as string;
        const client = new OAuth2Client(googleClientId);

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: googleClientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email_verified) {
            return next(new ErrorHandler(400, "Email not verified with Google"));
        }

        const { email, sub, given_name, family_name } = payload;


        console.log(payload)

        // Check if the user exists
        let user = await User.findOne({ googleId: sub });

        if (!user) {
            // Register new user
            user = new User({
                firstName: given_name,
                lastName: family_name || '',
                email,
                googleId: sub,
            });
            await user.save();
        }

        const JWT_SECRET = envConfig.get('jwtSecret') as string;
        // Generate JWT
        const jwtPayload = { userId: user._id, googleId: user.googleId };

        const jwtToken: String = jwt.sign(
            jwtPayload,
            JWT_SECRET!,
            { expiresIn: '24h' }
        );

        res.cookie('Authtoken', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });


        res.json({
            success: true,
            message: user ? 'User logged in successfully' : 'User registered and logged in successfully',
            user
        });
    } catch (error) {
        console.log(error);
        return next(new ErrorHandler(400, "Email not verified with Google"));

    }
};


interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        googleId: string;
    };
}

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {

            return next(new ErrorHandler(401, "Unauthorized access"));

        }

        // Find the user by `userId` set by the `authenticateJWT` middleware
        const user = await User.findById(req.user.userId).select('-googleId -__v'); // Exclude sensitive fields if necessary

        if (!user) {
            return next(new ErrorHandler(404, "User not found"));

        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return next(new ErrorHandler(500, "Internal Server Error"));

        next(error);
    }
};

// Logout controller
export const logout = (req: Request, res: Response): void => {
    res.clearCookie('Authtoken', { path: '/' });
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};