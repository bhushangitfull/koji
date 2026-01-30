import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'koji',
    user: process.env.DB_USER || 'koji_user',
    password: process.env.DB_PASSWORD || 'password',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  // External APIs
  openaiApiKey: process.env.OPENAI_API_KEY,

  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8081',
  frontendPort: parseInt(process.env.FRONTEND_PORT || '8081', 10),

  // Feature Flags
  enableRedis: process.env.ENABLE_REDIS === 'true',
  enableJobs: process.env.ENABLE_JOBS === 'true',

  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default env;
