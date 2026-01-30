import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import env from './config/env';
import { initRedis } from './config/redis';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponse } from './types';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const response: ApiResponse<{ status: string; timestamp: string }> = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  const response: ApiResponse<null> = {
    success: false,
    error: 'Endpoint not found',
  };
  res.status(404).json(response);
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize server
const PORT = env.port;

const startServer = async () => {
  try {
    // Initialize Redis if enabled
    if (env.enableRedis) {
      await initRedis();
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════╗
║      Koji Backend Server           ║
║      Running on port ${PORT}        ║
║      Environment: ${env.nodeEnv}          ║
╚════════════════════════════════════╝
      `);

      if (env.isDevelopment) {
        console.log(`API Documentation: http://localhost:${PORT}/api`);
        console.log(`Health Check: http://localhost:${PORT}/health`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
