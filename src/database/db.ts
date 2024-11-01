import mongoose from 'mongoose';
import envConfig from '../config/envConfig';

interface DBConnection {
    isConnected?: boolean | number;
}

const connection: DBConnection = {};

export async function connectDB(): Promise<void> {
    if (connection.isConnected) {
        console.log('📦 Using existing database connection');
        return;
    }

    try {
        const db = await mongoose.connect(envConfig.get('dbUrl'), {
            dbName: envConfig.get('dbName'),
        });

        connection.isConnected = db.connections[0].readyState;
        console.log('✅ Database connected successfully');

        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('🔗 MongoDB connected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            process.exit(1);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('❌ MongoDB disconnected');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Database connection error:', error);
        process.exit(1);
    }
}