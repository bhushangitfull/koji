import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

// Get user progress dashboard
router.get(
  '/dashboard',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      // TODO: Implement progress dashboard
      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Progress dashboard coming soon' },
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch progress',
      };
      res.status(500).json(response);
    }
  }
);

// Get weekly data
router.get(
  '/weekly-data',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Weekly data coming soon' },
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch weekly data',
      };
      res.status(500).json(response);
    }
  }
);

// Get vocabulary progress
router.get(
  '/vocabulary',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Vocabulary progress coming soon' },
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch vocabulary progress',
      };
      res.status(500).json(response);
    }
  }
);

export default router;
