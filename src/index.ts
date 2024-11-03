import express, { Request, Response } from 'express';
import envConfig from './config/envConfig';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './database/db';
import router from './routes';
import errorMiddleware from './middlewares/globalErrorhandler';

// Create Server
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//CORS setup
app.use(
    cors({
        origin: [envConfig.get('frontendURL'), 'http://localhost:4173'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'authtoken'],
        exposedHeaders: ['set-cookie'],
    })
);

// Connect to the database
connectDB();


app.use('/api/v1', router);



// Test route for checking if server running or not
app.get(
    '/',
    async (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
);


// Error handler
app.use(errorMiddleware); // Custom error handler



// Start the server and listen for incoming requests on the specified port
const port = envConfig.get('port');
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});