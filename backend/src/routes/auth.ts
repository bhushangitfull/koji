import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import UserModel from '../models/User';
import { ApiResponse, AuthResponse } from '../types';

const router = Router();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty().trim(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Validation failed',
        message: errors.array().map(e => e.msg).join(', '),
      };
      res.status(400).json(response);
      return;
    }

    try {
      const { email, password, name } = req.body;

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Email already registered',
        };
        res.status(400).json(response);
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await UserModel.create(email, passwordHash, name);

      // Fixed jwt.sign call
      const token = jwt.sign(
        { userId: user.id },
        env.jwt.secret as jwt.Secret,
        { expiresIn: env.jwt.expiresIn as any}
      );

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: { ...user },
          token,
          expiresIn: env.jwt.expiresIn,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Registration failed',
      };
      res.status(500).json(response);
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid credentials',
      };
      res.status(400).json(response);
      return;
    }

    try {
      const { email, password } = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid email or password',
        };
        res.status(401).json(response);
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid email or password',
        };
        res.status(401).json(response);
        return;
      }

      // Fixed jwt.sign call
      const token = jwt.sign(
        { userId: user.id },
        env.jwt.secret as jwt.Secret,
        { expiresIn: env.jwt.expiresIn as any}
      );

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          user: { ...user},
          token,
          expiresIn: env.jwt.expiresIn,
        },
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Login failed',
      };
      res.status(500).json(response);
    }
  }
);

export default router;