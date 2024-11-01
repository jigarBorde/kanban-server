
import * as dotenv from 'dotenv'
dotenv.config()


type EnvConfig = {
    port: number;
    nodeEnv: string;
    frontendURL: string;
    dbUrl: string;
    dbName: string;
    jwtSecret: string;
    googleClientId: number | string;
}

const _envVars: EnvConfig = {
    port: Number(process.env.PORT) || 5001,
    nodeEnv: process.env.NODE_ENV || '',
    frontendURL: process.env.FRONTEND_URL || '',
    dbUrl: process.env.DB_URI || '',
    dbName: process.env.DB_NAME || '',
    jwtSecret: process.env.JWT_SECRET || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
};


function getEnvValue<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    const value = _envVars[key];

    if (value === undefined || value === '') {
        throw new Error(`Missing environment variable: ${String(key)}`);
    }

    return value;
}

// Create a read-only interface for accessing environment variables
const envConfig = {
    get: getEnvValue
} as const;

export default envConfig;

// Optional: Export type for use in other files
export type { EnvConfig };