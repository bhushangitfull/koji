import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { ApiResponse } from '../types';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: { id: string; email: string };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Access token required',
    };
    res.status(401).json(response);
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid or expired token',
    };
    res.status(403).json(response);
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, env.jwt.secret) as { userId: string };
      req.userId = decoded.userId;
    } catch (error) {
      console.log('Invalid token provided, continuing without auth');
    }
  }

  next();
};

export default authenticateToken;
